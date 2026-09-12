#!/bin/bash
# Script per aggiornare automaticamente le gallerie del portfolio e pubblicare su GitHub/Vercel.
# Fai doppio clic su questo file per rigenerare il database, sincronizzare photo_web e fare il deploy.

# Vai alla cartella contenente questo script
cd "$(dirname "$0")"

echo "============================================="
echo " AGGIORNAMENTO PORTFOLIO MAX SALVAGGIO"
echo "============================================="
echo ""
echo "[1/4] Scansione cartelle e generazione WebP..."
python3 scan.py

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ ERRORE durante la scansione Python. Operazione interrotta."
    read -p "Premi Invio per uscire..."
    exit 1
fi

echo ""
echo "[2/4] Aggiunta modifiche all'area di staging Git..."
git add .

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ ERRORE durante 'git add'. Operazione interrotta."
    read -p "Premi Invio per uscire..."
    exit 1
fi

echo ""
echo "[3/4] Creazione commit..."
git diff --cached --quiet
if [ $? -eq 0 ]; then
    echo "ℹ️  Nessuna modifica da committare. Il portfolio è già aggiornato."
else
    git commit -m "chore(portfolio): auto-update images and archive data"
    if [ $? -ne 0 ]; then
        echo ""
        echo "❌ ERRORE durante 'git commit'. Operazione interrotta."
        read -p "Premi Invio per uscire..."
        exit 1
    fi

    echo ""
    echo "[4/4] Push su GitHub (attiva deploy Vercel)..."
    git push origin main
    if [ $? -ne 0 ]; then
        echo ""
        echo "❌ ERRORE durante 'git push'. Controlla la connessione o le credenziali Git."
        read -p "Premi Invio per uscire..."
        exit 1
    fi

    echo ""
    echo "============================================="
    echo " ✅ Portfolio aggiornato e pubblicato!"
    echo " Il deploy su Vercel è in corso."
    echo " Visita: https://www.maxsalvaggio.com"
    echo "============================================="
fi

echo ""
read -p "Premi Invio per uscire..."
