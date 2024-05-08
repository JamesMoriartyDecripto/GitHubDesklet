#!/bin/bash

# Definisce il percorso della cartella sorgente del desklet
SOURCE_DIR="$(pwd)/github-notifier@JamesMoriartyDecripto"

# Definisce il percorso della cartella di destinazione dei desklets
DEST_DIR="/home/{user}/.local/share/cinnamon/desklets"

# Nome del desklet
DESKLET_DIR="github-notifier@JamesMoriartyDecripto"

# Controlla se la cartella esiste già nella destinazione
if [ -d "$DEST_DIR/$DESKLET_DIR" ]; then
    echo "Rimozione della vecchia versione del desklet..."
    rm -rf "$DEST_DIR/$DESKLET_DIR"
fi

# Copia la nuova versione del desklet nella directory dei desklets
echo "Copia della nuova versione del desklet..."
cp -r "$SOURCE_DIR" "$DEST_DIR"

# Conferma operazione completata
echo "Desklet installato correttamente in $DEST_DIR/$DESKLET_DIR"
