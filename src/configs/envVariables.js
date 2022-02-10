export const envVariables = {
  baseUrl: process.env.baseUrl || "http://localhost:3000",
  port: process.env.PORT || 8000,
  connectString:
    process.env.CONNSTR ||
    "mongodb+srv://016526585700:016526585700@cluster0.xzigp.mongodb.net/doancnpm?retryWrites=true&w=majority",
  tokenSecret: process.env.JWTSERCRET || "doanTotNghiep",
  refreshTokenSecret: process.env.REFRESHTOKEN || "doantotnghieprefresh",
  tokenLife: "30d",
  refreshTokenLife: 86400,
  customerTokenLife: "30d",
  googleClientId:
    process.env.clientId ||
    "40792845616-i0phd247ebg64f68q17f8vo055c9nk9r.apps.googleusercontent.com",
  googleClientSecret: process.env.clientSecret || "PpcvPGaH7kc78NneAOfaOoNq",
  numOfPerPage: 12 || process.env.numOfPerPage,
  cloud_name: process.env.CLOUD_NAME || "dacnpm17n2",
  api_key_cloud: process.env.API_KEY_CLOUD || 232775572756875,
  api_secret_cloud:
    process.env.API_SECRET_CLOUD || "bfBoZeZCJVFov7NhKJIqsP9W8M0",
  nodeEnv: process.env.NODE_ENV || "development",
  nodemailerEmail: process.env.nodemailerEmail || "dacnpm17n2@gmail.com",
  nodemailerPassword: process.env.nodemailerPassword || "qweQWE!@#",
  API_GOOGLEMAP_KEY:
    process.env.api_googlemap_key || "AIzaSyDTlNkVmEcfZ5ICLzfmE48b8TWulg7G5Hs",
  my_address: "62/07, nguyen luong bang, hoa khanh, lien chieu, da nang",
  public_key:
    "-----BEGIN PUBLIC KEY-----" +
    "MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAgQ1Vy2+y9UrU/Bs/cQ++V0SqQYScDmLpU746U20ZfD1USsNJ2213HOfV3LpCqbKURfop7VO+Dm2ZFgLDodrCM3GxIqDeGALUkg7ATuNXBa8dGL+NKPYxFNypB6bQ9y84STQRqxT1p0vFEpHihVfcTw5CECXAoKduN644DRCyOgC1wKLbBJuhqwA5JciePblaLv/p343snv3JKHhk/4XOgeBQZfAZ+ho0gK7J7QV/z+aajQFaQDsaVq3xSbvqpVz0yAJBABqlc/y5c+O1GjO5I+IhirFnvARUMqt1kjsONPpTuRlzURiQPrlpiYeHmOhnJwPIZcHJt4cTtuxAtg0cl4gf3zyRsH/FaMi2gOp1IAhNYLWAcMSU91zkDZ8GBl+q6dhTXBumaytFBhbawxEGfYXr4iwzk+Nts6hK8pAI1bfekruc7uRDCuqA2LkV0KHvvfG4N/h0VJUEO+SjmTxjHlLLQ2+PW7Lo/0H2vKp/33vQQCuzsrjwLyoJBfkS4d+KsltJKQYJamnjTS4POfHUDHZlW7PHfjIoWK49KHOHuDkz7G9JG3J1QQL60B1Y1kBvRxZTrxOeotqd64z8SgoWPRhpfnCJGI5acgX9d4Acbi1IiVjnQ8ILYBmLd5+PFEy/ydZei2mrXp4Qxym/vnmd9qxoi3KA58jB0/656M2P7JECAwEAAQ==" +
    "-----END PUBLIC KEY-----",
  partner_code: "MOMOBFGB20211225",
  secret_key: "Ck2v96m4SeqiVy3VWqXzm5bBE8EQl2ps",
};
