#!/bin/bash
echo "🧹 Cleaning EduCertEngine..."
rm -f dev.log workflow-test-output.log *.log
rm -rf certificate-test-screenshots/ module-certificates-screenshots/ template-type-screenshots/ dynamic-builder-screenshots/ workflow-screenshots/ test-screenshots/
rm -f *-report.json test-report.json
rm -f *.old *.backup *.bak *~
rm -rf .next/
echo "✅ Cleanup completed!"
