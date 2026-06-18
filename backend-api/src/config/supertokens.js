const SuperTokens = require("supertokens-node");
const Session = require("supertokens-node/recipe/session");
const EmailPassword = require("supertokens-node/recipe/emailpassword");

SuperTokens.init({
  framework: "express",
  supertokens: {
    connectionURI: "https://try.supertokens.com",
  },
  appInfo: {
    appName: "MPS Connect",
    apiDomain: "http://localhost:5000",
    websiteDomain: "http://localhost:3000",
    apiBasePath: "/auth",
    websiteBasePath: "/auth",
  },
  recipeList: [EmailPassword.init(), Session.init()],
});

module.exports = SuperTokens;
