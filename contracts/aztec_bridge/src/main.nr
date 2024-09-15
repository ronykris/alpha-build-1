contract TokenBridge {
    use dep::aztec::prelude::{FunctionSelector, AztecAddress, EthAddress, PublicMutable, SharedImmutable};
    use dep::token_portal_content_hash_lib::{get_mint_public_content_hash, get_mint_private_content_hash, get_withdraw_content_hash};
    use dep::token::Token;

    #[aztec(storage)]
    struct Storage {
        token: PublicMutable<AztecAddress>,
        portal_address: SharedImmutable<EthAddress>,
    }

    #[aztec(public)]
    #[aztec(initializer)]
    fn constructor(token: AztecAddress, portal_address: EthAddress) {
        storage.token.write(token);
        storage.portal_address.initialize(portal_address);
    }

    #[aztec(private)]
    fn get_portal_address() -> EthAddress {
        storage.portal_address.read_private()
    }


    #[aztec(public)]
    fn get_portal_address_public() -> EthAddress {
        storage.portal_address.read_public()
    }

     #[aztec(private)]
    fn claim_private(
        secret_hash_for_redeeming_minted_notes: Field, // secret hash used to redeem minted notes at a later time. This enables anyone to call this function and mint tokens to a user on their behalf
        amount: Field,
        secret_for_L1_to_L2_message_consumption: Field // secret used to consume the L1 to L2 message
    ) {
        // Consume L1 to L2 message and emit nullifier
        let content_hash = get_mint_private_content_hash(secret_hash_for_redeeming_minted_notes, amount);
        context.consume_l1_to_l2_message(
            content_hash,
            secret_for_L1_to_L2_message_consumption,
            storage.portal_address.read_private()
        );

        // Mint tokens on L2
        // `mint_private` on token is public. So we call an internal public function
        // which then calls the public method on the token contract.
        // Since the secret_hash is passed, no secret is leaked.
        TokenBridge::at(context.this_address())._call_mint_on_token(amount, secret_hash_for_redeeming_minted_notes).enqueue(&mut context);
    }

    #[aztec(public)]
    #[aztec(internal)]
    fn _call_mint_on_token(amount: Field, secret_hash: Field) {
        Token::at(storage.token.read()).mint_private(amount, secret_hash).call(&mut context);
    }
    // docs:end:call_mint_on_token

    // docs:start:assert_token_is_same
    #[aztec(public)]
    #[aztec(internal)]
    fn _assert_token_is_same(token: AztecAddress) {
        assert(storage.token.read().eq(token), "Token address is not the same as seen in storage");
    }
}