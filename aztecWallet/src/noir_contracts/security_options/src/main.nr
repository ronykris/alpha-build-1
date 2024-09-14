// Account contract that uses ECDSA signatures for authentication on the same curve as Ethereum.
// The signing key is stored in a mutable private note and can be rotated.
contract EcdsaKAccountwithKeyRotation {
    use dep::aztec::prelude::{PrivateContext, PrivateMutable};
    use dep::aztec::{
        encrypted_logs::encrypted_note_emission::encode_and_encrypt_note,
        keys::getters::get_current_public_keys
    };
    use dep::authwit::{
        entrypoint::{app::AppPayload, fee::FeePayload}, account::AccountActions,
        auth_witness::get_auth_witness
    };
    use dep::ecdsa_public_key_note::EcdsaPublicKeyNote;

    #[aztec(storage)]
    struct Storage {
        public_key: PrivateMutable<EcdsaPublicKeyNote>,
    }

    // Creates a new account out of an ECDSA public key to use for signature verification
    #[aztec(private)]
    #[aztec(initializer)]
    fn constructor(signing_pub_key_x: [u8; 32], signing_pub_key_y: [u8; 32]) {
        let this = context.this_address();
        let this_keys = get_current_public_keys(&mut context, this);
        let mut pub_key_note = EcdsaPublicKeyNote::new(signing_pub_key_x, signing_pub_key_y, this_keys.npk_m.hash());
        storage.public_key.initialize(&mut pub_key_note).emit(encode_and_encrypt_note(&mut context, this, this));
    }

    // Note: If you globally change the entrypoint signature don't forget to update account_entrypoint.ts
    #[aztec(private)]
    fn entrypoint(app_payload: AppPayload, fee_payload: FeePayload, cancellable: bool) {
        let actions = AccountActions::init(&mut context, is_valid_impl);
        actions.entrypoint(app_payload, fee_payload, cancellable);
    }

    #[aztec(private)]
    #[aztec(noinitcheck)]
    #[aztec(view)]
    fn verify_private_authwit(inner_hash: Field) -> Field {
        let actions = AccountActions::init(&mut context, is_valid_impl);
        actions.verify_private_authwit(inner_hash)
    }

   #[contract_library_method]
    fn is_valid_impl(context: &mut PrivateContext, outer_hash: Field) -> bool {
        // Load public key from storage
        let storage = Storage::init(context);
        let public_key_emission = storage.public_key.get_note();
        let public_key = public_key_emission.note; // Access the actual note

        // Load auth witness
        let witness: [Field; 64] = unsafe {
            get_auth_witness(outer_hash)
        };
        let mut signature: [u8; 64] = [0; 64];
        for i in 0..64 {
            signature[i] = witness[i] as u8;
        }

        // Verify payload signature using Ethereum's signing scheme
        let outer_hash_bytes: [u8; 32] = outer_hash.to_be_bytes();
        let hashed_message: [u8; 32] = std::hash::sha256(outer_hash_bytes);
        std::ecdsa_secp256k1::verify_signature(public_key.x, public_key.y, signature, hashed_message)
    }

    // Function to rotate the ECDSA public key
    #[aztec(private)]
    fn rotate_key(new_signing_pub_key_x: [u8; 32], new_signing_pub_key_y: [u8; 32]) {
        let this = context.this_address();
        let this_keys = get_current_public_keys(&mut context, this);
        // assert(is_valid_impl(&mut context, context.get_args_hash()), "Unauthorized key rotation");
        let mut new_pub_key_note = EcdsaPublicKeyNote::new(new_signing_pub_key_x, new_signing_pub_key_y, this_keys.npk_m.hash()); 
        // Replace the current public key note with the new one
        storage.public_key.replace(&mut new_pub_key_note).emit(encode_and_encrypt_note(&mut context, this, this));
    }
}