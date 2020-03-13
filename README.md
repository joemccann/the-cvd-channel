<p align="center">
  <img alt="CVD-19 Virus" src="assets/img/botpic.jpg" />
</p>

# The CVD Channel

A free, open source Telegram Bot Broadcast Channel for keeping up to date on the Coronavirus with the latest news and statistics.

You can get subscribe to the channel here: [The CVD Channel](https://t.me/joinchat/AAAAAEuRIHPIX7un3AtlGg)

You can also choose to run it yourself or you can contribute to this project.

## Requirements

- [Microsoft Azure](https://portal.azure.com) Account
- [Telegram](https://telegram.org) Account
- [VS Code](https://code.visualstudio.com/) for Production Deployment and Local Development
- [Azure Functions](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurefunctions) VS Code Extension for Local Development
- [Node.js LTS Version](https://nodejs.org/en/about/releases/)

## Hacking

The CVD Bot has support for broadcasting to a private channel that Telegram users can subscribe to.

### Telegram Setup

- Create a *public* Telegram channel (not a group).
- Add your instance of your [CVD Bot](https://github.com/joemccann/the-cvd-bot) to it as an administrator.
- Execute the following `curl` command in your terminal:

```sh
curl -X POST https://api.telegram.org/bot[YOUR-API-KEY]/sendMessage\?chat_id\=@NAME_OF_YOUR_CHANNEL\&text\=test-public
```

In the response, grab the `chat_id` of the channel, it will be a negative number like `-12328834209`.

Now, mark your channel as *private* so users can only consume the content in it.

Execute the following `curl` command to test the private channel.

```sh
curl -X POST https://api.telegram.org/bot[YOUR-API-KEY]/sendMessage\?chat_id\=-11111111111\&text\=test-private
```

### Azure Setup

The following are Azure specific setup requirements and are in chronological order.

#### Azure Active Directory

- [Register an AAD application](https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps)
- Get the Application (client) ID
- Get the Directory (tenant) ID
- Then create a client secret and grab that value and store these in `locals.settings.json`.
- You need all 3 of these as `env` variables later.
- Under `API permissions` click "Add a Permission" and select `Azure Storage` and click the checkbox to enable `user_impersonation`. This will enable us to access the Blob Storage we will create next via our Azure Function client code. 

#### Azure Storage Account

- Create a new Blob Container called `the-cvd-bot-blob-container`.
- Under Access Managment (IAM) create a role of type `Storage Blob Data Container`.
- Assign access to an `Azure AD User, group or service principal`.
- Search for your AAD Security Principal (account) that you registered in the prior step.

### Local Setup

- Clone this repo and install dependencies.

```sh
git clone https://github.com/joemccann/the-cvd-channel.git
cd the-cvd-channel
npm i
```

- Create a `local.settings.json` file in the root of the repo and copy/paste the following:

```js
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "YOUR-STORAGE-STRING",
    "AZURE_TENANT_ID": "YOUR-TENANT-ID",
    "AZURE_CLIENT_ID": "YOUR-CLIENT-ID",
    "AZURE_CLIENT_SECRET": "YOUR-SECRET",
    "BLOB_SERVICE_ACCOUNT_NAME": "thecvdbot",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "CHANNEL_URL": "https://api.telegram.org/bot[YOUR-API-KEY]/sendMessage\?chat_id\=-11111111111\&parse_mode={mode}&text={text}"
  },
  "Host": {
    "LocalHttpPort": 7072
  }
}
```

The `CHANNEL_URL` is used for posting messages to your private broadcast channel.

We are adding the `LocalHttpPort` key and value to not clash with anything running on the default port of `7071` for other Azure Functions.

- For tesing your Azure Function locally, you'll need a `.env` file:

```sh
AZURE_TENANT_ID=XXX
AZURE_CLIENT_ID=YYY
AZURE_CLIENT_SECRET=ZZZ
BLOB_SERVICE_ACCOUNT_NAME=thecvdbot
CHANNEL_URL=https://api.telegram.org/bot[YOUR-BOT-TOKEN]/sendMessage?chat_id=[CHAT-ID-PRIVATE]&parse_mode={mode}&text={text}
```

In VS Code, run your function locally by using the Debug control.

## Tests

```sh
npm i -D
npm test
```

## Contributing

The general guidelines for contributing are:

- Does it fix a bug?
- Does it break anything?
- Does it stick to the original goal of The CVD Bot (an informational Telegram bot to keep up withg the CVD-19 virus)
- Does it reduce the build size?
- Is it necessary?

## Contributors

- [@joemccann](https://twitter.com/joemccann)

## License

MIT
