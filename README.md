# Doughmination Websites Monorepo

Welcome to the monorepo for all my websites.

# Contributors
<a href="https://github.com/doughmination/web/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=doughmination/web" />
</a>

## License
See the `LICENCE` file for details.

### Updating Submodules

We have a submodule, portfolio. This is code we use this locally:

```bash
git submodule update
git commit -a -m "Update the submodules"
git push
```

On the server we use:

```bash
git pull
git submodule update --init --recursive
```
