# sync files between development and production
#!/bin/bash

prompt_yes_no() {
    while true; do
        read -p "$1 (yes/no): " yn
        case $yn in
            [Yy]* ) return 0;;
            [Nn]* ) return 1;;  
            * ) echo "Please answer yes or no.";;
        esac
    done
}

# all paths are relative to root of the repository
cd "$(git rev-parse --show-toplevel)"
ngloverlay_commit_hash=$(git log -1 --format="%h" -- development/)
ssdb_commit_hash=$(git log -1 --format="%h" -- SSDB/)

echo "Sync files?"
if prompt_yes_no; then
    rsync -av  --exclude='Dockerfile' --exclude='httpserver-cors.py' development/sprintoverlay production &&
    rsync -av  --exclude='Dockerfile' --exclude='README.md' development/ssdb production &&
    echo "Development and production are synced."
else
    echo "Files are not synced."
fi

echo "Build docker images?"
if prompt_yes_no; then
    sudo docker build -t sprintoverlay-prod:$ngloverlay_commit_hash production/sprintoverlay &&
    sudo docker build -t ssdb-prod:$ssdb_commit_hash production/ssdb &&
    echo "sprintoverlay:$ngloverlay_commit_hash and ssdb:$ssdb_commit_hash are built." &&
    sed -i "2s|=.*$|=${ngloverlay_commit_hash}|" production/.env &&
    sed -i "3s|=.*$|=${ssdb_commit_hash}|" production/.env &&
    echo ".env file is updated."
else
    echo "Rebuilding is skipped."
fi