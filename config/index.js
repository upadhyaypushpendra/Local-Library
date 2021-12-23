export default {
    default_page_size: 30,
    locked_themes: 13,
    default_page_no: 1,
    default_order: "asc",
    default_order_by: "id",
    private_key_file: process.env.PRIVATE_KEY_FILE,
    public_key_file: process.env.PUBLIC_KEY_FILE,
    private_key_passphrase: process.env.PRIVATE_KEY_PASSPHRASE,
    access_token_expiry_after: parseInt(process.env.ACCESS_TOKEN_EXPIRY, 10),
    refresh_token_expiry_after: parseInt(process.env.REFRESH_TOKEN_EXPIRY, 10),
}
