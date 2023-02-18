import { AcademicRecord, Candidate, CourseEvaluationEntry, ethnicGroups, genders, HealthStatus, incomeGroups, nationalities, Nationality, ParentRelationship, parentRelationshipStatus, questionnaires, Religion, religions, RoutePath } from "@myuic-api/types";
import { createServer, Response as MirageResponse } from "miragejs";
import { backendUrl, isMock } from "./client";

export const enableMockServer = isMock;

function reduceKV<T>(arr: readonly T[], offset: number = 1): Record<number, T> {
  return arr.reduce((p, v, i) => {
    p[offset + i] = v;
    return p;
  }, {} as Record<number, T>);
}

const studentId = "203456789012"

export const useMockServer = () => {
  if (!enableMockServer) return;

  createServer({
    routes() {
      this.passthrough('/@windicss-devtools-update');

      this.urlPrefix = backendUrl;
      this.timing = parseInt(import.meta.env.VITE_MOCKSERVER_TIMING ?? '2000');

      this.get(RoutePath('checkHealth'), () => ({
        isAlive: true,
        status: 200
      } as HealthStatus));
      
      this.post(RoutePath('login'), (schema, request) => {
        const creds = JSON.parse(request.requestBody);
        if (creds.id !== studentId || creds.password !== "myuicneo") {
          return new MirageResponse(
            400,
            { "Content-Type": "application/json" },
            { message: "Invalid credentials." }
          );
        }

        return {
          token: "abc",
          refreshToken: "def",
        };
      });

      this.post(RoutePath('tokenRefresh'), (schema, request) => ({
        token: "abc",
        refreshToken: "def",
      }));

      this.delete(RoutePath('logout'), (schema, request) => ({
        message: "logout success",
      }));

      this.get(RoutePath('studentInfo'), (schema, request) => ({
        ID: "111111",
        LRN: "",
        number: studentId,
        ACR: "",
        lastName: "CRUZ",
        firstName: "JUAN",
        middleName: "DELA",
        suffix: "",
        gender: "Male",
        birthDate: "2001-12-25T00:00:00.000Z",
        birthPlace: "HOUSE",
        religion: "Roman Catholic",
        ethnicGroup: "Visayan",
        nationality: "Filipino",
        contactNumber: "09xxxxxxx",
        baptized: true,
        confirmed: true,
        email: "example@example.com",
        address: {
          address: "Davao City, Davao del Sur",
          city: "Davao City",
          province: "Davao del Sur",
          region: "Davao",
        },
        parentInformation: {
          father: {
            name: "JUANITO D. CRUZ",
            educationalAttainment: "COLLEGE",
            employer: "",
            occupation: "HOUSEHUSBAND",
            officeContactNumber: "",
          },
          mother: {
            name: "IGNACIA B. SANTOS",
            educationalAttainment: "COLLEGE",
            employer: "",
            occupation: "HOUSEWIFE",
            officeContactNumber: "",
          },
          status: "Living Together",
          address: {
            address: "BARANGAY PAGKAKAISA",
            city: "DAVAO CITY",
          },
          incomeGroup: "less than 10,000 / month",
          contactNumber: "09xxxxxxxx",
        },
        guardianInformation: {
          name: "",
          address: {
            address: "",
            city: "",
          },
          contactNumber: "",
        },
        educationalBackground: {
          gradeSchool: {
            school: "ABC SCHOOL",
            schoolYear: "2013-2014",
          },
          juniorHighSchool: {
            school: "DEF SCHOOL",
            schoolYear: "2017-2018",
          },
          seniorHighSchool: {
            school: "DEF SCHOOL",
            schoolYear: "2019-2020",
          },
          college: {
            school: "",
            schoolYear: "",
          },
          postGraduate: {
            school: "",
            schoolYear: "",
          },
        },
      }));

      this.patch(RoutePath('studentInfoUpdate'), () => ({
        message: 'Student information updated successfully.'
      }))

      this.get(RoutePath('studentFinancialRecords'), () => ({
        assessments: {
          tuition: [
            {
              priority: 9999,
              amount: 20500,
              amount_paid: 1250,
              balance: 19250.0,
              description: "Tuition Fee",
              type: "tuition",
            },
          ],
          misc: [
            {
              priority: 10,
              amount: 161.95,
              amount_paid: 161.95,
              balance: 0,
              description: "CDS",
              type: "misc",
            },
            {
              priority: 10,
              amount: 10,
              amount_paid: 10,
              balance: 0,
              description: "ID Validation",
              type: "misc",
            },
            {
              priority: 11,
              amount: 20.8,
              amount_paid: 20.8,
              balance: 0,
              description: "Red Cross",
              type: "misc",
            },
            {
              priority: 12,
              amount: 50,
              amount_paid: 50,
              balance: 0,
              description: "SSG",
              type: "misc",
            },
            {
              priority: 13,
              amount: 75,
              amount_paid: 75,
              balance: 0,
              description: "Examination",
              type: "misc",
            },
            {
              priority: 13,
              amount: 255.1,
              amount_paid: 255.1,
              balance: 0,
              description: "ICT Development Fee",
              type: "misc",
            },
            {
              priority: 13,
              amount: 100,
              amount_paid: 100,
              balance: 0,
              description: "RVM Insurance",
              type: "misc",
            },
            {
              priority: 13,
              amount: 0,
              amount_paid: 0,
              balance: 0,
              description: "Recollection",
              type: "misc",
            },
            {
              priority: 25,
              amount: 583.77,
              amount_paid: 583.77,
              balance: 0,
              description: "EdTech",
              type: "misc",
            },
            {
              priority: 30,
              amount: 150,
              amount_paid: 150,
              balance: 0,
              description: "Linkage and Partnership Fee",
              type: "misc",
            },
            {
              priority: 100,
              amount: 93.6,
              amount_paid: 93.6,
              balance: 0,
              description: "DACS",
              type: "misc",
            },
          ],
          others: [
            {
              priority: 1,
              amount: 283.21,
              amount_paid: 283.21,
              balance: 0,
              description: "Registration",
              type: "others",
            },
            {
              priority: 25,
              amount: 415.13,
              amount_paid: 415.13,
              balance: 0,
              description: "Internet Fee",
              type: "others",
            },
            {
              priority: 25,
              amount: 742.71,
              amount_paid: 742.71,
              balance: 0,
              description: "Library Fee",
              type: "others",
            },
            {
              priority: 25,
              amount: 339.01,
              amount_paid: 339.01,
              balance: 0,
              description: "Research Fee",
              type: "others",
            },
            {
              priority: 25,
              amount: 490.52,
              amount_paid: 490.52,
              balance: 0,
              description: "Facilities Development",
              type: "others",
            },
            {
              priority: 25,
              amount: 434.54,
              amount_paid: 434.54,
              balance: 0,
              description: "Guidance Services",
              type: "others",
            },
            {
              priority: 25,
              amount: 61.09,
              amount_paid: 61.09,
              balance: 0,
              description: "Medical/Dental",
              type: "others",
            },
            {
              priority: 900,
              amount: 0,
              amount_paid: 0,
              balance: 0,
              description: "Laboratory Fee",
              type: "others",
            },
          ],
          receivables: [
            {
              priority: 9999,
              amount: 3585.2800000000134,
              amount_paid: 3585.279999999999,
              balance: 0,
              description: "Account Receivables",
              type: "receivables",
            },
          ],
        },
        paymentHistory: [
          {
            cashier: "Chinkee",
            orSig: "U",
            orNo: 200000,
            amount: 3549.15,
            paidAt: "2022-01-11T00:00:00.000Z",
          },
          {
            cashier: "Manny",
            orSig: "Y",
            orNo: 2111111,
            amount: 5100,
            paidAt: "2022-01-18T00:00:00.000Z",
          },
        ],
        monthlyDues: [
          {
            amount: 4800.7,
            semesterId: 486,
            remarks: "",
            balance: 0,
            month: 1,
            status: "Paid",
          },
          {
            amount: 4800.7,
            semesterId: 486,
            remarks: "",
            balance: 1102.24,
            month: 2,
            status: "",
          },
          {
            amount: 4800.7,
            semesterId: 486,
            remarks: "",
            balance: 4800.7,
            month: 3,
            status: "",
          },
          {
            amount: 6800.38,
            semesterId: 486,
            remarks: "",
            balance: 6800.38,
            month: 4,
            status: "",
          },
          {
            amount: 6800.38,
            semesterId: 486,
            remarks: "Grantee",
            balance: 6800.38,
            month: 5,
            status: "Partially Paid",
          },
        ],
      }));

      this.get(RoutePath('studentClassSchedule'), () => ({
        periodId: "486",
        courses: [
          {
            schedule: "(3:00PM-6:00PM [M])/(3:00PM-6:00PM [W])",
            schedules: [
              {
                fromTime: "3:00PM",
                toTime: "6:00PM",
                day: "M",
                isAlternate: false
              },
              {
                fromTime: "3:00PM",
                toTime: "6:00PM",
                day: "W",
                isAlternate: false
              },
            ],
            room: "OL-2ndT",
            instructor: "Gates",
            code: "CC221",
            name: "Web Applications Development 2",
            units: 2,
            type: "Lec",
          },
          {
            schedule: "(3:00PM-6:00PM [M])/(3:00PM-6:00PM [W])",
            schedules: [
              {
                fromTime: "3:00PM",
                toTime: "6:00PM",
                day: "M",
                isAlternate: false
              },
              {
                fromTime: "3:00PM",
                toTime: "6:00PM",
                day: "W",
                isAlternate: false
              },
            ],
            room: "OL-2ndT",
            instructor: "Gates",
            code: "CC221",
            name: "Web Applications Development 2",
            units: 1,
            type: "Lab",
          },
          {
            schedule: "(12:00PM-3:00PM [T])/(12:00PM-3:00PM [Th])",
            schedules: [
              {
                fromTime: "12:00PM",
                toTime: "3:00PM",
                day: "T",
                isAlternate: false
              },
              {
                fromTime: "12:00PM",
                toTime: "3:00PM",
                day: "Th",
                isAlternate: false
              },
            ],
            room: "OL-2ndT",
            instructor: "Gates",
            code: "CC222",
            name: "Advanced Database Systems",
            units: 2,
            type: "Lec",
          },
          {
            schedule: "(12:00PM-3:00PM [T])/(12:00PM-3:00PM [Th])",
            schedules: [
              {
                fromTime: "12:00PM",
                toTime: "3:00PM",
                day: "T",
                isAlternate: false
              },
              {
                fromTime: "12:00PM",
                toTime: "3:00PM",
                day: "Th",
                isAlternate: false
              },
            ],
            room: "OL-2ndT",
            instructor: "Gates",
            code: "CC222",
            name: "Advanced Database Systems",
            units: 1,
            type: "Lab",
          },
          {
            schedule: "(8:00AM-11:00AM [M])/(8:00AM-11:00AM [W])",
            schedules: [
              {
                fromTime: "8:00AM",
                toTime: "11:00AM",
                day: "M",
                isAlternate: false
              },
              {
                fromTime: "8:00AM",
                toTime: "11:00AM",
                day: "W",
                isAlternate: false
              },
            ],
            room: "1stT",
            instructor: "Lee",
            code: "CC223",
            name: "Project Management",
            units: 3,
            type: "Lec",
          },
          {
            schedule: "(3:00PM-7:00PM [M])/(3:00PM-7:00PM [W])",
            schedules: [
              {
                fromTime: "3:00PM",
                toTime: "7:00PM",
                day: "M",
                isAlternate: false
              },
              {
                fromTime: "3:00PM",
                toTime: "7:00PM",
                day: "W",
                isAlternate: false
              },
            ],
            room: "1stT",
            instructor: "Gates",
            code: "CS221",
            name: "Human Computer Interaction with Robotics",
            units: 3,
            type: "Lec",
          },
          {
            schedule: "(3:00PM-7:00PM [M])/(3:00PM-7:00PM [W])",
            schedules: [
              {
                fromTime: "3:00PM",
                toTime: "7:00PM",
                day: "M",
                isAlternate: false
              },
              {
                fromTime: "3:00PM",
                toTime: "7:00PM",
                day: "W",
                isAlternate: false
              },
            ],
            room: "1stT",
            instructor: "Gates",
            code: "CS221",
            name: "Human Computer Interaction with Robotics",
            units: 1,
            type: "Lab",
          },
          {
            schedule: "(3:00PM-6:00PM [M])/(3:00PM-6:00PM [W])",
            schedules: [
              {
                fromTime: "3:00PM",
                toTime: "6:00PM",
                day: "M",
                isAlternate: false
              },
              {
                fromTime: "3:00PM",
                toTime: "6:00PM",
                day: "W",
                isAlternate: false
              },
            ],
            room: "OL-2ndT",
            instructor: "Zuckerberg",
            code: "CS222",
            name: "Architecture & Organization",
            units: 2,
            type: "Lec",
          },
          {
            schedule: "(3:00PM-6:00PM [M])/(3:00PM-6:00PM [W])",
            schedules: [
              {
                fromTime: "3:00PM",
                toTime: "6:00PM",
                day: "M",
                isAlternate: false
              },
              {
                fromTime: "3:00PM",
                toTime: "6:00PM",
                day: "W",
                isAlternate: false
              },
            ],
            room: "OL-2ndT",
            instructor: "Zuckerberg",
            code: "CS222",
            name: "Architecture & Organization",
            units: 1,
            type: "Lab",
          },
          {
            schedule: "(3:00PM-6:00PM [T])/(3:00PM-6:00PM [Th])",
            schedules: [
              {
                fromTime: "3:00PM",
                toTime: "6:00PM",
                day: "T",
                isAlternate: false
              },
              {
                fromTime: "3:00PM",
                toTime: "6:00PM",
                day: "Th",
                isAlternate: false
              },
            ],
            room: "1stT",
            instructor: "Rizal",
            code: "GEC009",
            name: "Life & Works of Rizal",
            units: 3,
            type: "Lec",
          },
          {
            schedule: "(8:00AM-11:00AM/12:00PM-3:00PM [M])/(8:00AM-11:00AM/12:00PM-3:00PM [W])",
            schedules: [
              {
                fromTime: "8:00AM",
                toTime: "11:00AM",
                day: "M",
                isAlternate: false
              },
              {
                fromTime: "8:00AM",
                toTime: "11:00AM",
                day: "W",
                isAlternate: false
              },
              {
                fromTime: "12:00PM",
                toTime: "3:00PM",
                day: "M",
                isAlternate: true
              },
              {
                fromTime: "12:00PM",
                toTime: "3:00PM",
                day: "W",
                isAlternate: true
              },
            ],
            room: "OL-2ndT",
            instructor: "Lee",
            code: "GEC010",
            name: "Living in the IT Era",
            units: 2,
            type: "Lec",
          },
          {
            schedule: "(8:00AM-11:00AM/12:00PM-3:00PM [M])/(8:00AM-11:00AM/12:00PM-3:00PM [W])",
            schedules: [
              {
                fromTime: "8:00AM",
                toTime: "11:00AM",
                day: "M",
                isAlternate: false
              },
              {
                fromTime: "8:00AM",
                toTime: "11:00AM",
                day: "W",
                isAlternate: false
              },
              {
                fromTime: "12:00PM",
                toTime: "3:00PM",
                day: "M",
                isAlternate: true
              },
              {
                fromTime: "12:00PM",
                toTime: "3:00PM",
                day: "W",
                isAlternate: true
              },
            ],
            room: "OL-2ndT",
            instructor: "Lee",
            code: "GEC010",
            name: "Living in the IT Era",
            units: 1,
            type: "Lab",
          },
          {
            schedule: "(6:00PM-9:00PM [T])/(6:00PM-9:00PM [Th])",
            schedules: [
              {
                fromTime: "6:00PM",
                toTime: "9:00PM",
                day: "T",
                isAlternate: false
              },
              {
                fromTime: "6:00PM",
                toTime: "9:00PM",
                day: "Th",
                isAlternate: false
              },
            ],
            room: "2ndT",
            instructor: "Diaz",
            code: "PE221",
            name: "Physical Education 4",
            units: 2,
            type: "Lec",
          },
          {
            schedule: "(8:00AM-11:00AM [T])/(8:00AM-11:00AM [Th])",
            schedules: [
              {
                fromTime: "8:00AM",
                toTime: "11:00AM",
                day: "T",
                isAlternate: false
              },
              {
                fromTime: "8:00AM",
                toTime: "11:00AM",
                day: "Th",
                isAlternate: false
              },
            ],
            room: "OL-1stT",
            instructor: "Espiritu",
            code: "RS002",
            name: "Religions, Religious Experiences & Spirituality",
            units: 3,
            type: "Lec",
          },
        ],
      }));

      this.get<AcademicRecord>(RoutePath('studentAcademicRecord'), () => ({
        studentPermanentRecordId: "12632",
        report: {
          courses: [
            {
              code: "RS001",
              name: "Essentials of Catholic Faith & Life",
              units: 3,
              type: "Lec",
              section: "ND-1A",
              school: "UIC-Davao",
              prelimGrade: 40,
              midtermGrade: 40,
              finalsGrade: 40,
              overallGrade: 70,
            },
            {
              code: "GEC004",
              name: "Art Appreciation",
              units: 3,
              type: "Lec",
              section: "BSIT-1B",
              school: "UIC-Davao",
              prelimGrade: 90,
              midtermGrade: 80,
              finalsGrade: 95,
              overallGrade: 88.33
            },
            {
              code: "GEC007",
              name: "Understanding the Self",
              units: 3,
              type: "Lec",
              section: "PSYCH2-Merge 2",
              school: "UIC-Davao",
              prelimGrade: 90,
              midtermGrade: 90,
              finalsGrade: 90,
              overallGrade: 90
            },
            {
              code: "CALC001",
              name: "Differential Calculus",
              units: 4,
              type: "Lec",
              section: "BSCS-1A",
              school: "UIC-Davao",
              prelimGrade: 90,
              midtermGrade: 90,
              finalsGrade: 90,
              overallGrade: 90
            },
            {
              code: "CC111",
              name: "Introduction to Computing",
              units: 3,
              type: "Lec",
              section: "BSIT-1B",
              school: "UIC-Davao",
              prelimGrade: 90,
              midtermGrade: 90,
              finalsGrade: 90,
              overallGrade: 90
            },
            {
              code: "CC112",
              name: "Computer Programming 1",
              units: 3,
              type: "Lec",
              section: "BSCS-1A",
              school: "UIC-Davao",
              prelimGrade: 90,
              midtermGrade: 90,
              finalsGrade: 90,
              overallGrade: 90
            },
            {
              code: "CS111",
              name: "Discrete Structures 1",
              units: 3,
              type: "Lec",
              section: "BSCS-1A",
              school: "UIC-Davao",
              prelimGrade: 90,
              midtermGrade: 90,
              finalsGrade: 90,
              overallGrade: 90
            },
            {
              code: "PE111",
              name: "Physical Education 1",
              units: 2,
              type: "Lec",
              section: "BSIT-1B",
              school: "UIC-Davao",
              prelimGrade: 90,
              midtermGrade: 90,
              finalsGrade: 90,
              overallGrade: 90
            },
            {
              code: "NSTP1",
              name: "National Service Training Program 1 (CWTS1)",
              units: 3,
              type: "Lab",
              section: "BSCS-1A",
              school: "UIC-Davao",
              prelimGrade: 90,
              midtermGrade: 90,
              finalsGrade: 90,
              overallGrade: 90
            },
          ]
        },
      }));

      this.get(RoutePath('studentClearance'), () => ({
        id: 14688,
        items: [
          {
            priority: 1,
            label: "Registrar",
            id: 13,
            status: "cleared",
            requirements: [
              {
                remarks: "Personal Profile",
                status: "cleared",
              },
              {
                remarks: "2x2 ID Picture",
                status: "cleared",
              },
              {
                remarks: "Original PSA Birth Certificate",
                status: "cleared",
              },
              {
                remarks: "Form 137-A / Report Card / Transfer Credentials",
                status: "cleared",
              },
            ],
          },
          {
            priority: 2,
            label: "Libraries",
            id: 14,
            status: "cleared",
            requirements: [],
          },
          {
            priority: 21,
            label: "Guidance",
            id: 33,
            status: "cleared",
            requirements: [
              {
                remarks: "Online Faculty Evaluation",
                status: "cleared",
              },
              {
                remarks: "Personal Data Sheet (PDS)",
                status: "cleared",
              },
              {
                remarks: "Psychological Test (LSI)",
                status: "cleared",
              },
            ],
          },
          {
            priority: 23,
            label: "Cashier",
            id: 20,
            status: "cleared",
            requirements: [
              {
                remarks: "Full Payment",
                status: "cleared",
              },
              {
                remarks: "Liquidation Report",
                status: "cleared",
              },
              {
                remarks: "Laboratory Breakages",
                status: "cleared",
              },
              {
                remarks: "Other Payables",
                status: "cleared",
              },
            ],
          },
        ],
      }));

      this.get(RoutePath('semesterList'), () => [
        {
          id: "484",
          label: "Summer 2019",
          fromYear: 2019,
          toYear: null,
        },
        {
          id: "485",
          label: "First Semester 2019-2020",
          fromYear: 2019,
          toYear: 2020,
        },
        {
          id: "486",
          label: "Second Semester 2019-2020",
          fromYear: 2019,
          toYear: 2020,
        },
        {
          id: "484",
          label: "Summer 2020",
          fromYear: 2020,
          toYear: null,
        },
        {
          id: "485",
          label: "First Semester 2020-2021",
          fromYear: 2020,
          toYear: 2021,
        },
        {
          id: "486",
          label: "Second Semester 2020-2021",
          fromYear: 2020,
          toYear: 2021,
        },
        {
          id: "484",
          label: "Summer 2021",
          fromYear: 2021,
          toYear: null,
        },
        {
          id: "485",
          label: "First Semester 2021-2022",
          fromYear: 2021,
          toYear: 2022,
        },
        {
          id: "486",
          label: "Second Semester 2021-2022",
          fromYear: 2021,
          toYear: 2022,
        },
        {
          id: "488",
          label: "Summer 2022",
          fromYear: 2022,
          toYear: null,
        },
        {
          id: "489",
          label: "First Semester 2022-2023",
          fromYear: 2022,
          toYear: 2023,
        },
        {
          id: "490",
          label: "Second Semester 2022-2023",
          fromYear: 2022,
          toYear: 2023,
        },
        {
          id: "488",
          label: "Summer 2023",
          fromYear: 2023,
          toYear: null,
        },
        {
          id: "489",
          label: "First Semester 2023-2024",
          fromYear: 2023,
          toYear: 2024,
        },
        {
          id: "490",
          label: "Second Semester 2023-2024",
          fromYear: 2023,
          toYear: 2024,
        },
        {
          id: "488",
          label: "Summer 2024",
          fromYear: 2024,
          toYear: null,
        },
        {
          id: "489",
          label: "First Semester 2024-2025",
          fromYear: 2024,
          toYear: 2025,
        },
        {
          id: "490",
          label: "Second Semester 2024-2025",
          fromYear: 2024,
          toYear: 2025,
        },
      ]);

      this.get(RoutePath('resourceLinksList'), () => [
        {
          name: "Resources",
          entries: [
            {
              iconUrl:
                "https://my.uic.edu.ph/assets/images/educational_png/follett_destiny.jpg",
              href: "http://destiny.uic.edu.ph/",
              label: "DESTINY",
            },
            {
              iconUrl:
                "https://my.uic.edu.ph:443/assets/images/educational_png/emerald.jpg",
              href: "http://emeraldinsight.com.uiclrsc.remotexs.co/",
              label: "EMERALD INSIGHT",
            },
            {
              iconUrl:
                "https://my.uic.edu.ph:443/assets/images/educational_png/eric.jpg",
              href: "http://eric.ed.gov.uiclrsc.remotexs.co/",
              label: "ERIC",
            },
            {
              iconUrl:
                "https://my.uic.edu.ph:443/assets/images/educational_png/infortrac.jpg",
              href: "http://infotrac.galegroup.com/itweb/phuic",
              label: "INFOTRACK",
            },
            {
              iconUrl:
                "https://my.uic.edu.ph:443/assets/images/educational_png/follett_destiny.jpg",
              href: "http://portal.igpublish.com.uiclrsc.remotexs.co/iglibrary/search/main",
              label: "IG LIBRARY",
            },
            {
              iconUrl:
                "https://my.uic.edu.ph:443/assets/images/educational_png/proquest.jpg",
              href: "http://search.proquest.com.uiclrsc.remotexs.co/",
              label: "PROQUEST",
            },
            {
              iconUrl:
                "https://my.uic.edu.ph:443/assets/images/educational_png/inforboard.jpg",
              href: "http://theinfoboard-smart.net/",
              label: "THE INFOBOARD",
            },
          ],
        },
      ]);

      this.get(RoutePath('facultyEvaluation'), () => [
        {
          code: "CS212",
          name: "Automata Theory & Formal Languages",
          type: "Lec",
          instructor: "Alan Turing",
          instructorImageUrl: "https://i.pinimg.com/originals/7a/39/b9/7a39b9d359159e2f275f1e92bc5ebf67.jpg",
          status: "open",
        },
        {
          code: "CS212",
          name: "Automata Theory & Formal Languages",
          type: "Lab",
          instructor: "Alan Turing",
          instructorImageUrl: "https://i.pinimg.com/originals/7a/39/b9/7a39b9d359159e2f275f1e92bc5ebf67.jpg",
          status: "open",
        },
        {
          code: "CS211",
          name: "Networks & Communications",
          type: "Lec",
          instructor: "Alan Kay",
          instructorImageUrl: "https://cdn.idolnetworth.com/medias/profile/11/alan-kay.jpg",
          status: "open",
        },
        {
          code: "CS211",
          name: "Networks & Communications",
          type: "Lab",
          instructor: "Alan Kay",
          instructorImageUrl: "https://cdn.idolnetworth.com/medias/profile/11/alan-kay.jpg",
          status: "open",
        },
        {
          code: "CS213",
          name: "Algorithms & Complexity",
          type: "Lec",
          instructor: "Donald Knuth",
          instructorImageUrl: "https://www.premiosfronterasdelconocimiento.es/wp-content/uploads/sites/2/2019/06/FBBVA-10-tic-Knuth.jpg",
          status: "open",
        },
        {
          code: "GEC006",
          name: "Readings in Philippine History",
          type: "Lec",
          instructor: "Carlos Celdran",
          instructorImageUrl: "https://1cms-img.imgix.net/Celdran.jpg?auto=compress",
          status: "open",
        },
        {
          code: "CC214",
          name: "Information Management",
          type: "Lec",
          instructor: "Bill Gates",
          instructorImageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a8/Bill_Gates_2017_%28cropped%29.jpg",
          status: "open",
        },
        {
          code: "CC214",
          name: "Information Management",
          type: "Lab",
          instructor: "Bill Gates",
          instructorImageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a8/Bill_Gates_2017_%28cropped%29.jpg",
          status: "open",
        },
        {
          code: "CC211",
          name: "Web Applications Development 1",
          type: "Lec",
          instructor: "Bill Gates",
          instructorImageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a8/Bill_Gates_2017_%28cropped%29.jpg",
          status: "open",
        },
        {
          code: "CC211",
          name: "Web Applications Development 1",
          type: "Lab",
          instructor: "Bill Gates",
          instructorImageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a8/Bill_Gates_2017_%28cropped%29.jpg",
          status: "open",
        },
        {
          code: "CC213",
          name: "Systems Integration & Architecture",
          type: "Lec",
          instructor: "Paul Rand",
          instructorImageUrl: "https://www.logomaker.com/wp-content/uploads/2012/03/portrait111-e1332173042365.jpg",
          status: "open",
        },
        {
          code: "CC213",
          name: "Systems Integration & Architecture",
          type: "Lab",
          instructor: "Paul Rand",
          instructorImageUrl: "https://www.logomaker.com/wp-content/uploads/2012/03/portrait111-e1332173042365.jpg",
          status: "open",
        },
        {
          code: "PE211",
          name: "Physical Education 3",
          type: "Lec",
          instructor: "Hidilyn Diaz",
          instructorImageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Hidilyn_Diaz_with_her_gold_medal_2021_%281-44_screenshot%29.jpg",
          status: "open",
        },
        {
          code: "CC212",
          name: "Object-Oriented Programming",
          type: "Lec",
          instructor: "James Gosling",
          instructorImageUrl: "https://pbs.twimg.com/profile_images/1060661254853865472/Oj2V9k6Y_400x400.jpg",
          status: "open",
        },
        {
          code: "CC212",
          name: "Object-Oriented Programming",
          type: "Lab",
          instructor: "James Gosling",
          instructorImageUrl: "https://pbs.twimg.com/profile_images/1060661254853865472/Oj2V9k6Y_400x400.jpg",
          status: "open",
        },
      ] as CourseEvaluationEntry[]);

      this.get(RoutePath('facultyEvaluationQuestionnaires'), () => questionnaires);
      this.get(RoutePath('facultyEvaluationIds'), (_, req) => {
        const classId = req.queryParams!.classId;
        const classType = req.queryParams!.classType;
        if (!req.queryParams || !classId || !classType)
          return new MirageResponse(400, {
            'Content-Type': 'application/json'
          }, {
            message: 'classId and classType is required.'
          });

        return new MirageResponse(200, {
          'Content-Type': 'application/json'
        }, {
          classId,
          classType,
          instructorID: 1
        });
      });
      this.post(RoutePath('facultyEvaluationSubmit'), () => ({
        message: 'Evaluation submitted successfully.'
      }))

      this.get(RoutePath('ethnicGroupsList'), () => reduceKV(ethnicGroups));
      this.get(RoutePath('genderList'), () => reduceKV(genders));
      this.get(RoutePath('incomeGroupsList'), () => reduceKV(incomeGroups));
      this.get(RoutePath('nationalitiesList'), () => reduceKV(nationalities));
      this.get(RoutePath('parentRelationshipStatusesList'), () => reduceKV(parentRelationshipStatus));
      this.get(RoutePath('religionList'), () => reduceKV(religions, 100));
      this.get(RoutePath('additionalStudentInfo'), () => ({ semesterId: 486, year: 'Second Year', course: 'Bachelor of Science in Computer Science' }));
      this.get(RoutePath("studentElectionsCandidates"), () => []);
    },
  });
};
