# AFP4 Storymap

## Running the app in a local computer

### Preparing the local computer

To run this app in your local computer you will need to [install Node.js](https://nodejs.org/en/download/) first.

It is recommended to [install GIT](https://github.com/git-guides/install-git) as well. This will make it very simple to get the latest developments or switch to different stages of the development. The rest of this guide assumes you installed it.

Both Node.js and GIT are general software development technologies.

### Cloning the repository

Once you have the required software you will need to download the code. You can do so by opening a terminal window, navigating to the directory of your choice and execute the following command:

```bash
git clone https://github.com/NuGlobalSolutionsLLC/AFP04-storymap.git
```

This command will create a directory named `NGS` with the app code.

> If you wish, you can also use GitHub Desktop to clone the repo. More info on: https://docs.github.com/en/desktop/contributing-and-collaborating-using-github-desktop/adding-and-cloning-repositories/cloning-and-forking-repositories-from-github-desktop

> If you don't want to use GIT you can also download the code from the [repository webpage](https://github.com/NuGlobalSolutionsLLC/AFP04-storymap) and unzip it in your file system, then follow the rest of the instructions.

### Install the dependencies

Once you have the code, move into the `NGS` directory and install the app software dependencies using the following command:

```bash
npm install
```

These are the libraries and software used in this particular app (Quasar, Vue, Leaflet,...).

### Start the app in development mode (hot-code reloading, error reporting, etc.)

Now you can run the app locally using the following command:

```bash
quasar dev
```

This will automatically open up a new browser window with the app. You will still need Internet connection for the base maps and login.

### Download the new developments

As development progresses new features will be available. To update the code in your local computer and see those features, you only need to open a terminal window, navigate to the code root directory and execute the following command:

```bash
git pull
```

If the new developments include the use of new software, you may eventually need to install these new dependencies using the same command as before:

```bash
npm install
```

## Development

This section contains additional information for developers.

### Lint the files

```bash
yarn lint
# or
npm run lint
```

### Format the files

```bash
yarn format
# or
npm run format
```

### Build the app for production

```bash
quasar build
```

### Customize the configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).

### Log into website on browser:

https://app.nuglobalsolutions.com/storymap/afp4/  
Login: guest  
Pass: WsN0Ye

# Deploy Vue App to EC2

This guide provides instructions on how to build and deploy a Vue.js application to an EC2 instance. The application will be copied to the Apache web server directory.

## Step-by-Step Instructions

### 1. Build the Vue.js Application

First, navigate to the project directory and run the build command:

- Using npm:
  ```bash
  npm run build
  ```
- Using yarn:
  ```bash
  yarn build
  ```

After the command completes, the compiled files will be generated in the `./dist/spa` folder.

### 2. Copy Files to EC2

To deploy the generated files to an EC2 instance, copy the contents of the `./dist/spa` directory to `/var/www/html/apps/storymap/afp4` on the EC2 server.

Use `scp` to securely copy the files:

```bash
scp -r ./dist/spa/* <your-username>@<ec2-ip>:/var/www/html/apps/storymap/afp4
```

Replace `<your-username>` and `<ec2-ip>` with the appropriate values for your EC2 instance.

### 3. Update ownership

After the files are copied, update the ownership and access permission:

```
chmown -R www-data:www-data ./storymap; chmod -R 777 ./storymap
```

### 4. Verify Deployment

After the files are updated, verify that the application is accessible by visiting:

```
http://<ec2-ip>/apps/storymap/afp4
```

Make sure the Nginx web server is running on your EC2 instance:

```bash
sudo systemctl restart nginx
```
