# Website

This website is built using [Docusaurus 2](https://docusaurus.io/), a modern static website generator.

## Contributing

If you want to propose changes on the website, you can fork the repository and make a PR against the `staging` branch. If you are a regular contributor, you will be added to the `webdevelopers` group, which allows you to create a new branch directly on this repository.

Any of the Arrow `webdevelopers` will be able to review your changes and merge the PR once approved. Upon merge, the `staging` branch will automatically trigger a deployment to the arrow [staging environment](https://stg.arrowair.com). Once staging looks good, a PR will be created to the `main` branch, automatically deploying to [production](https://www.arrowair.com).

### Installation

```
$ yarn
```

### Local Development

```
$ yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server. Oh, i forgot to add this.

### Build

```
$ yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.
