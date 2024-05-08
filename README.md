# GitHubDesklet
Simple Linux Debian desklet to track GitHub's notification

## Manual installation

1. Clone this repo

```
git clone https://github.com/JamesMoriartyDecripto/GitHubDesklet.git
```

2. Enter the directory

```
cd GitHubDesklet
```

3. In the file `install_desklet.sh` change `{user}` with your user of the computer

`DEST_DIR="/home/{user}/.local/share/cinnamon/desklets"`

4. Install the desklet

```
chmod +x install_desklet.sh
```

```
./install_desklet.sh
```

5. Restart Cinnamon

Press `Alt + F2` then type `r` and press enter

6. Add the desklet

    - Right click with the mouse on the Desktop
    - Add Desklets
    - Select `GitHub Notifier`
    - Click the `+` button below

7. Add the GitHub Token

    - Go on GitHub
    - Click your image in the top right corner
    - Click on `Settings`
    - On the left side click `Developer settings` (the last one)
    - Click on `Personal access token`
    - Choose `Tokens (classic)`
    - Click on `Generate new token`
    - Choose `Generate new token (classic)`
    - In the `Note` field insert a name for the token
    - Set the `Expiration` that you prefer
    - Check the `notifications` checkbox
    - Click on `Generate token` (green button at the end)