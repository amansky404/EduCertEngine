# 🎯 Quick Testing Reference Card

## 📋 Test Progress Tracker

**Date**: _______________  
**Tester**: _______________  
**Browser**: Chrome  
**Start Time**: _______________

---

## ✅ Quick Checklist

### Phase 1: Super Admin (8 tests)
- [ ] 1.1 Registration
- [ ] 1.2 Login
- [ ] 1.3 Create Harvard University
- [ ] 1.4 View University
- [ ] 1.5 Edit University
- [ ] 1.6 Create Stanford University
- [ ] 1.7 Disable/Enable
- [ ] 1.8 Delete

### Phase 2: University Admin (3 tests)
- [ ] 2.1 Admin Login
- [ ] 2.2 Dashboard
- [ ] 2.3 Branding

### Phase 3: Templates (6 tests)
- [ ] 3.1 HTML Builder
- [ ] 3.2 PDF Mapper
- [ ] 3.3 Direct Upload
- [ ] 3.4 Edit Template
- [ ] 3.5 View Template
- [ ] 3.6 Delete Template

### Phase 4: Students (7 tests)
- [ ] 4.1 Add Single (Alice)
- [ ] 4.2 Bulk CSV (10 students)
- [ ] 4.3 View Student
- [ ] 4.4 Edit Student
- [ ] 4.5 Search Students
- [ ] 4.6 Filter Students
- [ ] 4.7 Delete Student

### Phase 5: Documents (8 tests)
- [ ] 5.1 View List
- [ ] 5.2 Filter Documents
- [ ] 5.3 View Document
- [ ] 5.4 Download
- [ ] 5.5 Publish/Unpublish
- [ ] 5.6 Regenerate
- [ ] 5.7 Bulk Actions
- [ ] 5.8 Delete Document

### Phase 6: Public Portal (10 tests)
- [ ] 6.1 Landing Page
- [ ] 6.2 Search by Roll
- [ ] 6.3 Search by Reg
- [ ] 6.4 Search by Mobile
- [ ] 6.5 Search by DOB
- [ ] 6.6 View Certificate
- [ ] 6.7 Download Certificate
- [ ] 6.8 Verify QR
- [ ] 6.9 Not Found
- [ ] 6.10 Unpublished Security

**Progress**: ___ / 41 tests completed

---

## 🔑 Test Credentials

### Super Admin
```
Email: Test Super Admin / superadmin@test.com
Password: Test@12345
```

### Harvard Admin
```
Email: admin@harvard.edu
Password: Admin@12345
```

### Stanford Admin
```
Email: admin@stanford.edu
Password: Admin@12345
```

---

## 🌐 URLs

| Page | URL |
|------|-----|
| Home | http://localhost:3000 |
| Super Admin Register | http://localhost:3000/superadmin/register |
| Super Admin Login | http://localhost:3000/superadmin/login |
| University Admin | http://localhost:3000/admin/login |
| Public Search | http://localhost:3000/search |
| Database | http://localhost:5555 |

---

## 📊 Test Data Quick Copy

### Harvard University
```
Name: Harvard University
Subdomain: harvard
Admin: admin@harvard.edu
Password: Admin@12345
Color: #A51C30
```

### Student - Alice Johnson
```
Name: Alice Johnson
Roll: H2024001
Reg: REG-H-2024-001
Mobile: +1-617-555-0001
Email: alice.johnson@harvard.edu
DOB: 01/15/2000
Course: Computer Science
```

### Bulk CSV (Copy & Paste)
```csv
studentName,rollNo,regNo,mobile,email,dateOfBirth,courseName,grade,cgpa
Bob Smith,H2024002,REG-H-2024-002,+1-617-555-0002,bob.smith@harvard.edu,02/20/2000,Physics,A-,3.85
Carol White,H2024003,REG-H-2024-003,+1-617-555-0003,carol.white@harvard.edu,03/10/2000,Mathematics,A+,4.00
David Brown,H2024004,REG-H-2024-004,+1-617-555-0004,david.brown@harvard.edu,04/05/2000,Chemistry,B+,3.70
Eve Davis,H2024005,REG-H-2024-005,+1-617-555-0005,eve.davis@harvard.edu,05/15/2000,Biology,A,3.90
Frank Miller,H2024006,REG-H-2024-006,+1-617-555-0006,frank.miller@harvard.edu,06/20/2000,Economics,A-,3.80
Grace Wilson,H2024007,REG-H-2024-007,+1-617-555-0007,grace.wilson@harvard.edu,07/25/2000,History,A,3.88
Henry Moore,H2024008,REG-H-2024-008,+1-617-555-0008,henry.moore@harvard.edu,08/30/2000,Literature,B+,3.65
Ivy Taylor,H2024009,REG-H-2024-009,+1-617-555-0009,ivy.taylor@harvard.edu,09/12/2000,Psychology,A+,3.98
Jack Anderson,H2024010,REG-H-2024-010,+1-617-555-0010,jack.anderson@harvard.edu,10/18/2000,Engineering,A,3.92
Kate Thomas,H2024011,REG-H-2024-011,+1-617-555-0011,kate.thomas@harvard.edu,11/22/2000,Law,A-,3.82
```

---

## 🐛 Quick Bug Report

**Bug #**: ____  
**Test**: ____  
**Severity**: Critical / High / Medium / Low  
**Description**: _______________________________________________  
**Screenshot**: Saved as _______________  

---

## 📸 Screenshots Taken

1. [ ] Super Admin Registration
2. [ ] University Creation
3. [ ] Admin Dashboard
4. [ ] Branding Config
5. [ ] HTML Template Builder
6. [ ] CSV Upload
7. [ ] Student List
8. [ ] Document List
9. [ ] PDF Viewer
10. [ ] Public Search
11. [ ] Certificate View
12. [ ] Error Messages

---

## ⏱️ Time Tracking

| Phase | Start | End | Duration |
|-------|-------|-----|----------|
| Phase 1 | __:__ | __:__ | ___ min |
| Phase 2 | __:__ | __:__ | ___ min |
| Phase 3 | __:__ | __:__ | ___ min |
| Phase 4 | __:__ | __:__ | ___ min |
| Phase 5 | __:__ | __:__ | ___ min |
| Phase 6 | __:__ | __:__ | ___ min |
| **Total** | | | ___ min |

---

## 📊 Final Results

**Tests Passed**: ___ / 41  
**Tests Failed**: ___ / 41  
**Success Rate**: ___%  
**Bugs Found**: ___  
**Overall Rating**: ⭐⭐⭐⭐⭐

---

## 💡 Notes

_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________

---

**End Time**: _______________  
**Tested By**: _______________  
**Sign Off**: _______________
