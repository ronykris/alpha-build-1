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


    TokenBridge::at(context.this_address())._call_mint_on_token(amount, secret_hash_for_redeeming_minted_notes).enqueue(&mut context);
}

// This is a public call as we need to read from public storage.
// Also, note that user hashes their secret in private and only sends the hash in public
// meaning only user can `redeem_shield` at a later time with their secret.
#[aztec(public)]
#[aztec(internal)]
fn _call_mint_on_token(amount: Field, secret_hash: Field) {
    Token::at(storage.token.read()).mint_private(amount, secret_hash).call(&mut context);
}

#[aztec(public)]
#[aztec(view)]
fn get_token() -> AztecAddress {
    storage.token.read()
}