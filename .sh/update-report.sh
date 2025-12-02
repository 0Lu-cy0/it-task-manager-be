#!/bin/bash
# Script generate GoAccess report

LOG_FILE="/var/log/nginx/access.log"
REPORT_FILE="/mnt/d/it-task-manager-backend-fake/report.html"

sudo goaccess $LOG_FILE \
  --log-format=COMBINED \
  -o $REPORT_FILE

echo "✅ Report updated at $(date)"
