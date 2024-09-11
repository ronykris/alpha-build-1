// Escrow contract with time-lock feature
contract Escrow {
    use dep::aztec::prelude::{AztecAddress, EthAddress, FunctionSelector, NoteHeader, PrivateContext, PrivateImmutable};
    use dep::aztec::{
        encrypted_logs::encrypted_note_emission::encode_and_encrypt_note_with_keys,
        keys::getters::get_current_public_keys
    };
    use dep::address_note::address_note::AddressNote;
    use dep::token::Token;

    #[aztec(storage)]
    struct Storage {
        owner: PrivateImmutable<AddressNote>,
        release_time: Field,
    }

    // Creates a new instance
    #[aztec(private)]
    #[aztec(initializer)]
    fn constructor(owner: AztecAddress, lock_duration: Field) {
        let owner_keys = get_current_public_keys(&mut context, owner);
        let msg_sender_keys = get_current_public_keys(&mut context, context.msg_sender());
        
        let mut note = AddressNote::new(owner, owner_keys.npk_m.hash());
        
        storage.owner.initialize(&mut note).emit(
            encode_and_encrypt_note_with_keys(&mut context, msg_sender_keys.ovpk_m, owner_keys.ivpk_m, owner)
        );

        storage.release_time = context.current_timestamp() + lock_duration;
    }

    // Withdraws balance. Requires that msg.sender is the owner and the release time has passed.
    #[aztec(private)]
    fn withdraw(token: AztecAddress, amount: Field, recipient: AztecAddress) {
        let sender = context.msg_sender();
        let note = storage.owner.get_note();
        assert(note.address == sender);
        assert(context.current_timestamp() >= storage.release_time);

        Token::at(token).transfer(recipient, amount).call(&mut context);
    }

    // Updates the release time. Only the owner can call this.
    #[aztec(private)]
    fn update_release_time(new_release_time: Field) {
        let sender = context.msg_sender();
        let note = storage.owner.get_note();
        assert(note.address == sender);
        
        storage.release_time = new_release_time;
    }

    // Returns the current release time
    #[aztec(private)]
    fn get_release_time() -> Field {
        storage.release_time
    }
}