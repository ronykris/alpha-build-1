use dep::std;

struct BridgeState {
    eth_bridge_address: Field,
    total_deposits: Field,
    balances: [Field; 100],
    users: [Field; 100],
    user_count: Field,
}

fn init(eth_bridge: Field) -> BridgeState {
    BridgeState {
        eth_bridge_address: eth_bridge,
        total_deposits: 0,
        balances: [0; 100],
        users: [0; 100],
        user_count: 0,
    }
}

fn deposit(state: BridgeState, sender: Field, user: Field, amount: Field) -> BridgeState {
    assert(sender == state.eth_bridge_address, "Invalid sender");
    
    let mut new_state = state;
    let mut user_exists = false;
    let mut user_index = new_state.user_count;

    for i in 0..100 {
        let i_field = Field::from(i);
        if std::field::lt(i_field, new_state.user_count) && new_state.users[i] == user {
            user_exists = true;
            user_index = i_field;
        }
    }

    if !user_exists {
        assert(std::field::lt(new_state.user_count, Field::from(100)), "Too many users");
        new_state.users[new_state.user_count.as_u32()] = user;
        new_state.user_count = new_state.user_count + Field::from(1);
    }

    new_state.balances[user_index.as_u32()] += amount;
    new_state.total_deposits += amount;

    std::log("Deposit", (user, amount));

    new_state
}

fn withdraw(state: BridgeState, sender: Field, user: Field, amount: Field) -> (BridgeState, Field) {
    assert(sender == user, "Sender must be the user");

    let mut new_state = state;
    let mut user_exists = false;
    let mut user_index = Field::from(0);

    for i in 0..100 {
        let i_field = Field::from(i);
        if std::field::lt(i_field, new_state.user_count) && new_state.users[i] == user {
            user_exists = true;
            user_index = i_field;
        }
    }

    assert(user_exists, "User not found");
    assert(new_state.balances[user_index.as_u32()] >= amount, "Insufficient balance");

    new_state.balances[user_index.as_u32()] -= amount;
    new_state.total_deposits -= amount;

    std::log("Withdrawal", (user, amount));

    (new_state, amount)
}

fn get_balance(state: BridgeState, user: Field) -> pub Field {
    let mut balance = Field::from(0);
    for i in 0..100 {
        let i_field = Field::from(i);
        if std::field::lt(i_field, state.user_count) && state.users[i] == user {
            balance = state.balances[i];
        }
    }
    balance
}

fn get_total_deposits(state: BridgeState) -> pub Field {
    state.total_deposits
}