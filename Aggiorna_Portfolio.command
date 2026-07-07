#!/bin/bash
# Script per aggiornare automaticamente le gallerie del portfolio
# Fai doppio clic su questo file per rigenerare il database dopo aver aggiunto o rimosso immagini.

# Vai alla cartella contenente questo script
cd "$(dirname "$0")"

echo "=== AGGIORNAMENTO PORTFOLIO MAX SALVAGGIO ==="
echo "Scansione delle cartelle in corso..."

# Esegui lo script python
python3 scan.py

echo ""
echo "============================================="
echo "Aggiornamento completato con successo!"
echo "Puoi chiudere questa finestra."
echo "============================================="
read -p "Premi Invio per uscire..."
