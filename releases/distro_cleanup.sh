#!/bin/bash

DEVICE="$1"
PREFIX="$2"

if [ ! -d "$PREFIX" ]; then
    echo "Must specify a mount point"
    exit 1
fi

echo -n "Cleaning up roofts..."
sudo mount -o loop,offset=$((10*1024*1024)) "$DEVICE" "$PREFIX"

rm -f "$PREFIX"/root/.ash_history
rm -f "$PREFIX"/root/.ssh/*

cat < EOF > "$PREFIX"/etc/Wireless/wpa_supplicant.conf
ctrl_interface=/var/run/wpa_supplicant
update_config=1
country=IT
network={
 ssid="GStickOS"
 psk="GSstickOS"
}
EOF

sudo umount "$PREFIX"
echo "done!"

echo -n "Cleaning up extended partition..."
sudo mount -o loop,offset=$((138*1024*1024)) "$DEVICE" "$PREFIX"

rm -rf "$PREFIX"/retroarch/cheats/*
rm -f "$PREFIX"/retroarch/content_*.lpl
rm -rf "$PREFIX"/retroarch/logs/*
rm -rf "$PREFIX"/retroarch/playlists/*
rm -rf "$PREFIX"/retroarch/records/*
rm -rf "$PREFIX"/retroarch/saves/*
rm -rf "$PREFIX"/retroarch/screenshots/*
rm -rf "$PREFIX"/retroarch/states/*

sudo umount "$PREFIX"
echo "done!"
