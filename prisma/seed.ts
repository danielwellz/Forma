import bcrypt from "bcryptjs";
import {
  ContactMethod,
  ProjectCategory,
  RequestScope,
  RequestStatus,
  RequestType,
  Role,
  ServiceType,
} from "@prisma/client";
import { prisma } from "../lib/prisma";

const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@forma.ir";
const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "FormaAdmin123!";

const sampleProjects: Array<{
  slug: string;
  titleFa: string;
  category: ProjectCategory;
  locationFa: string;
  year: number;
  areaSqm: number;
  scopeFa: string;
  servicesProvided: ServiceType[];
  descriptionFa: string;
  featured?: boolean;
}> = [
  {
    slug: "tehran-residential-azadi",
    titleFa: "خانه آزدای",
    category: "RESIDENTIAL",
    locationFa: "تهران",
    year: 2024,
    areaSqm: 180,
    scopeFa: "طراحی و اجرا",
    servicesProvided: ["ARCHITECTURE", "INTERIOR", "DESIGN_BUILD"],
    descriptionFa: "بازطراحی کامل یک واحد مسکونی با تمرکز بر نور طبیعی، بهینه‌سازی گردش و متریال گرم.",
    featured: true,
  },
  {
    slug: "lavasan-villa-orchid",
    titleFa: "ویلای ارکید لواسان",
    category: "VILLA",
    locationFa: "لواسان",
    year: 2023,
    areaSqm: 420,
    scopeFa: "طراحی معماری",
    servicesProvided: ["ARCHITECTURE"],
    descriptionFa: "ویلای دوبلکس با هندسه مینیمال و تراس‌های پیوسته رو به منظره.",
    featured: true,
  },
  {
    slug: "valiasr-cafe-urban",
    titleFa: "کافه اوربن",
    category: "CAFE",
    locationFa: "تهران، ولیعصر",
    year: 2022,
    areaSqm: 135,
    scopeFa: "طراحی داخلی و بازسازی",
    servicesProvided: ["INTERIOR", "RENOVATION"],
    descriptionFa: "بازسازی یک کافه شهری با زبان متریال صنعتی-گرم و نورپردازی لایه‌ای.",
  },
  {
    slug: "saadatabad-office-loft",
    titleFa: "دفتر اداری لافت",
    category: "OFFICE",
    locationFa: "تهران، سعادت‌آباد",
    year: 2025,
    areaSqm: 260,
    scopeFa: "طراحی و اجرا",
    servicesProvided: ["INTERIOR", "DESIGN_BUILD"],
    descriptionFa: "دفتر تیم خلاق با فضاهای منعطف، اتاق جلسات آکوستیک و جزئیات اجرایی دقیق.",
    featured: true,
  },
  {
    slug: "karaj-commercial-wave",
    titleFa: "مجتمع تجاری ویو",
    category: "COMMERCIAL",
    locationFa: "کرج",
    year: 2021,
    areaSqm: 950,
    scopeFa: "معماری و طراحی نما",
    servicesProvided: ["ARCHITECTURE"],
    descriptionFa: "پروژه تجاری با پوسته پویا و سیرکولاسیون شفاف برای افزایش تعامل کاربران.",
  },
  {
    slug: "niavaran-restaurant-copper",
    titleFa: "رستوران کوپر",
    category: "RESTAURANT",
    locationFa: "تهران، نیاوران",
    year: 2024,
    areaSqm: 310,
    scopeFa: "طراحی داخلی",
    servicesProvided: ["INTERIOR"],
    descriptionFa: "طراحی رستوران با متریال مس و چوب، تفکیک دقیق سالن‌ها و نورپردازی نمایشی.",
  },
  {
    slug: "shiraz-villa-garden",
    titleFa: "ویلای باغ شیراز",
    category: "VILLA",
    locationFa: "شیراز",
    year: 2020,
    areaSqm: 380,
    scopeFa: "طراحی معماری و داخلی",
    servicesProvided: ["ARCHITECTURE", "INTERIOR"],
    descriptionFa: "تلفیق معماری معاصر با حیاط مرکزی و استفاده از متریال بومی منطقه.",
  },
  {
    slug: "isfahan-office-courtyard",
    titleFa: "دفتر حیاط اصفهان",
    category: "OFFICE",
    locationFa: "اصفهان",
    year: 2023,
    areaSqm: 210,
    scopeFa: "بازسازی",
    servicesProvided: ["RENOVATION", "INTERIOR"],
    descriptionFa: "تبدیل خانه قدیمی به دفتر اداری با حفظ هویت و جزئیات تاریخی.",
  },
  {
    slug: "mashhad-residential-nova",
    titleFa: "آپارتمان نووا",
    category: "RESIDENTIAL",
    locationFa: "مشهد",
    year: 2022,
    areaSqm: 160,
    scopeFa: "طراحی داخلی",
    servicesProvided: ["INTERIOR"],
    descriptionFa: "آپارتمان خانوادگی با پلان باز و طراحی سفارشی جزئیات آشپزخانه.",
  },
  {
    slug: "kish-commercial-marina",
    titleFa: "پروژه مارینا کیش",
    category: "COMMERCIAL",
    locationFa: "کیش",
    year: 2025,
    areaSqm: 1200,
    scopeFa: "طراحی-ساخت",
    servicesProvided: ["ARCHITECTURE", "DESIGN_BUILD"],
    descriptionFa: "پروژه چندمنظوره ساحلی با فازبندی ساخت و تحویل مرحله‌ای.",
  },
];

async function main() {
  await prisma.requestMessage.deleteMany();
  await prisma.requestNote.deleteMany();
  await prisma.requestFile.deleteMany();
  await prisma.estimate.deleteMany();
  await prisma.request.deleteMany();
  await prisma.availabilitySlot.deleteMany();
  await prisma.projectMedia.deleteMany();
  await prisma.project.deleteMany();
  await prisma.contentBlock.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      name: "مدیر فرما",
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      role: Role.SUPER_ADMIN,
      phone: "09120000000",
    },
  });

  const sales = await prisma.user.create({
    data: {
      name: "کارشناس فروش",
      email: "sales@forma.ir",
      passwordHash: await bcrypt.hash("FormaSales123!", 12),
      role: Role.SALES,
      phone: "09121111111",
    },
  });

  const client = await prisma.user.create({
    data: {
      name: "مشتری دمو",
      email: "client@forma.ir",
      passwordHash: await bcrypt.hash("FormaClient123!", 12),
      role: Role.CLIENT,
      phone: "09123333333",
    },
  });

  for (const [idx, item] of sampleProjects.entries()) {
    const project = await prisma.project.create({
      data: {
        slug: item.slug,
        titleFa: item.titleFa,
        category: item.category,
        locationFa: item.locationFa,
        year: item.year,
        areaSqm: item.areaSqm,
        scopeFa: item.scopeFa,
        servicesProvided: item.servicesProvided,
        descriptionFa: item.descriptionFa,
        featured: item.featured ?? false,
        published: true,
        coverImageUrl: `https://picsum.photos/seed/forma-cover-${idx + 1}/1200/800`,
        metaTitleFa: `${item.titleFa} | فرما`,
        metaDescriptionFa: item.descriptionFa,
      },
    });

    await prisma.projectMedia.createMany({
      data: [
        {
          projectId: project.id,
          type: "IMAGE",
          url: `https://picsum.photos/seed/forma-${idx + 1}-1/1200/900`,
          order: 0,
          altFa: `${item.titleFa} - تصویر ۱`,
        },
        {
          projectId: project.id,
          type: "IMAGE",
          url: `https://picsum.photos/seed/forma-${idx + 1}-2/1200/900`,
          order: 1,
          altFa: `${item.titleFa} - تصویر ۲`,
        },
      ],
    });
  }

  await prisma.contentBlock.createMany({
    data: [
      {
        key: "homepage_hero",
        contentFa: {
          companyNameFa: "گروه طراحی و ساخت فرما",
          taglineFa: "تخیل خود را بسازید",
          taglineEn: "Build your imagination",
          subtitleFa:
            "فرما با رویکرد طراحی-ساخت یکپارچه، از ایده تا تحویل نهایی پروژه‌های لوکس مسکونی، اداری و تجاری را با دقت اجرایی و زبان معماری معاصر هدایت می‌کند.",
        },
      },
      {
        key: "about",
        contentFa: {
          intro:
            "گروه طراحی و ساخت فرما یک استودیوی حرفه‌ای معماری و اجراست که با تمرکز بر کیفیت فضایی، جزئیات ساخت و مدیریت دقیق فرآیند، پروژه‌ها را از فاز مشاوره تا بهره‌برداری نهایی پیش می‌برد.",
        },
      },
      {
        key: "services",
        contentFa: {
          items: [
            {
              title: "مشاوره، طراحی و نوسازی ساختمان های لوکس",
              description:
                "برای پروژه‌های شاخص، از تحلیل زمینه و تعریف کانسپت تا طراحی فنی و مدیریت نوسازی، راهکاری منسجم ارائه می‌کنیم.",
            },
            {
              title: "بازسازی و بهینه سازی تخصصی ساختمان های فرسوده",
              description:
                "با نگاه مهندسی به سازه، تاسیسات و کیفیت فضایی، ساختمان‌های موجود را به استانداردهای عملکردی و زیبایی امروز ارتقا می‌دهیم.",
            },
            {
              title: "طراحی و اجرای دکوراسیون داخلی مسکونی، اداری و تجاری",
              description:
                "طراحی داخلی را متناسب با سبک زندگی، هویت برند و جزئیات اجرایی انجام می‌دهیم تا نتیجه نهایی دقیقاً قابل ساخت و ماندگار باشد.",
            },
            {
              title:
                "مشاوره ، طراحی و اجرای فضاهای بیرونی شامل لنداسکیپ ، فضای سبز و بام سبز",
              description:
                "در طراحی فضاهای باز، پیوستگی میان معماری، طبیعت و تجربه کاربر را حفظ می‌کنیم تا پروژه هویت کامل‌تری پیدا کند.",
            },
          ],
          extraText:
            "در تمام خدمات فرما، شفافیت زمان‌بندی، کنترل هزینه و کیفیت اجرا در اولویت قرار دارد.",
        },
      },
      {
        key: "contact",
        contentFa: {
          phones: ["۰۹۱۳۰۰۳۳۱۳۶", "۰۹۱۲۰۷۶۰۸۵۷", "۰۹۱۳۱۰۶۷۲۹۹"],
          workingHours:
            "شنبه تا چهارشنبه از ۹:۰۰ تا ۱۸:۰۰ - پنجشنبه ها از ۹:۰۰ تا ۱۴:۰۰ - به غیر از روزهای تعطیل",
          instagramHandle: "Formaco.ir",
          instagramUrl: "https://instagram.com/Formaco.ir",
          address: "اصفهان خیابان مهراباد مجتمع پارسیان .طبقه ۶",
          mapEmbedUrl:
            "https://www.google.com/maps?q=اصفهان+خیابان+مهراباد+مجتمع+پارسیان&output=embed",
          email: "",
        },
      },
    ],
  });

  const slot1 = await prisma.availabilitySlot.create({
    data: {
      startAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      endAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
    },
  });

  await prisma.availabilitySlot.create({
    data: {
      startAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      endAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
    },
  });

  await prisma.availabilitySlot.create({
    data: {
      startAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      endAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
    },
  });

  const request1 = await prisma.request.create({
    data: {
      type: RequestType.ESTIMATE,
      status: RequestStatus.IN_REVIEW,
      clientId: client.id,
      assignedToId: sales.id,
      projectType: ProjectCategory.RESIDENTIAL,
      locationCityFa: "تهران",
      addressFa: "جردن",
      areaSqm: 165,
      scope: RequestScope.DESIGN_BUILD,
      budgetMin: 800000000,
      budgetMax: 1500000000,
      timelineTarget: "پاییز ۱۴۰۵",
      descriptionFa: "درخواست طراحی و اجرای کامل واحد مسکونی ۱۶۵ متری.",
      preferredContactMethod: ContactMethod.WHATSAPP,
    },
  });

  const request2 = await prisma.request.create({
    data: {
      type: RequestType.CONSULTATION,
      status: RequestStatus.MEETING_SCHEDULED,
      clientId: client.id,
      assignedToId: sales.id,
      projectType: ProjectCategory.VILLA,
      locationCityFa: "لواسان",
      addressFa: "بلوار امام",
      scope: RequestScope.DESIGN_ONLY,
      descriptionFa: "نیاز به جلسه مشاوره اولیه برای طراحی ویلا.",
      preferredContactMethod: ContactMethod.PHONE,
      meetingStartAt: slot1.startAt,
      meetingEndAt: slot1.endAt,
    },
  });

  await prisma.availabilitySlot.update({
    where: { id: slot1.id },
    data: {
      isBooked: true,
      bookedRequestId: request2.id,
    },
  });

  await prisma.requestMessage.createMany({
    data: [
      {
        requestId: request1.id,
        authorId: sales.id,
        message: "سلام. درخواست شما دریافت شد و در حال بررسی است.",
      },
      {
        requestId: request1.id,
        authorId: client.id,
        message: "ممنون، نقشه‌ها را تا عصر ارسال می‌کنم.",
      },
    ],
  });

  await prisma.estimate.create({
    data: {
      requestId: request1.id,
      costAmount: 1250000000,
      currency: "IRR",
      timeEstimateText: "۴ ماه",
      nextStepsFa: "تایید برآورد، عقد قرارداد، شروع فاز طراحی تفصیلی.",
      sentAt: new Date(),
    },
  });

  await prisma.request.update({
    where: { id: request1.id },
    data: { status: RequestStatus.ESTIMATE_SENT },
  });

  console.log("Seed completed:", {
    admin: { email: adminEmail, password: adminPassword },
    demoClient: { email: "client@forma.ir", password: "FormaClient123!" },
  });
  console.log("Super admin id:", admin.id);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
