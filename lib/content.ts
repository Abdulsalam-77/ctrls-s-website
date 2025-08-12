export const content = {
  en: {
    header: {
      logoAlt: "CTRL-S Logo",
      navLinks: [
        { name: "Home", href: "/#hero" }, // Updated to hash link
        { name: "Why CTRL-S", href: "/#why-ctrl-s" }, // Updated to hash link
        { name: "Learning Path", href: "/#roadmap" }, // Updated to hash link
        { name: "Certificate", href: "/#certificate" }, // Updated to hash link
        { name: "Contact", href: "/contact" },
        { name: "Login", href: "/auth/login" }, // Added Login link
      ],
      cta: "Enroll Now",
    },
    hero: {
      headline: "We build thinkers, not just coders.",
      subtext: [
        // Changed to array of objects
        {
          icon: "Brain",
          text: "Building mindset with confidence, curiosity, and resilience.",
          highlight: "Building mindset",
        },
        {
          icon: "MessageCircle",
          text: "Training how to act through communication, problem-solving, and smart thinking.",
          highlight: "Training how to act",
        },
        {
          icon: "Wrench",
          text: "Using tech as a tool to shape thinkers for engineering, medicine, or any future path.",
          highlight: "Using tech as a tool",
        },
      ],
      cta: "Explore the Journey",
      imageAlt: "Modern tech illustration with robot and circuit brain",
    },
    whyCtrlsS: {
      title: "Why Choose CTRL-S?",
      points: [
        {
          icon: "Brain",
          shortTitle: "Thinkers, Not Just Coders",
          description:
            "We teach code as the powerful language of creation. By mastering it, students don't just build projects; they build a creative mindset to solve any problem.",
          mainFeatureImage: "/why-ctrl-s/Thinkers.png", // New property
        },
        {
          icon: "Users",
          shortTitle: "Soft Skills Build Their Future",
          description:
            "Beyond the clicks, there's a new way of thinking. This course builds the essential Soft Skills like structured problem-solving and resilience—that are critical for success on any future path.",
          mainFeatureImage: "/why-ctrl-s/soft-skills.png", // New property
        },
        {
          icon: "Laptop",
          shortTitle: "An Early Path to Success",
          description:
            "Imagine your teen entering university already mastering the skills others are just beginning to learn. That is the powerful advantage we provide. We introduce practical, high-level skills years ahead of schedule, building true confidence for their academic and professional future.",
          mainFeatureImage: "/why-ctrl-s/early-path.png", // New property
        },
        {
          icon: "Map",
          shortTitle: "A Roadmap You Can Trust",
          description:
            "No random lessons, no confusing path. We provide a structured roadmap where each lesson builds logically on the last. This clarity gives students the confidence to master new skills because they always know what’s next.",
          mainFeatureImage: "/why-ctrl-s/roadmap.png", // New property
        },
        {
          icon: "Heart",
          shortTitle: "A Learning Community That Feels Like Family",
          description:
            "To us, your teen is not just another student. We are personally invested in their journey, providing dedicated guidance and steadfast support they need to thrive. We don’t just build courses; we build relationships.",
          mainFeatureImage: "/why-ctrl-s/comunity .png", // New property
        },
      ],
    },
    roadmap: {
      title: "Level 1: Digital Foundations – ICT Level",
      description:
        "More than a course, this is the essential foundation for the modern world. We build true digital fluency, turning students into masters of the essential applications and core tech knowledge they need to excel with confidence in school and beyond.",
      level1: {
        headline: "The ICT Level: Practical & Theoretical Foundations",
        description:
          "Our foundational ICT level is split into two comprehensive sides: Practical skills in essential Microsoft Applications and Theoretical knowledge covering computer systems, networks, safety, and more.",
        modules: [
          {
            title: "Master Microsoft Office & Adapt",
            illustration: "/icons/dapt-icon.svg", // Placeholder for new image
            description: "Work confidently with Office tools and easily learn new technology",
          },
          {
            title: "Understand Core Tech",
            illustration: "/icons/tech.svg", // Placeholder for new image
            description: "Know how hardware, software, and networks really work",
          },
          {
            title: "Stay Safe & Smart Online",
            illustration: "/icons/stay-safe.svg", // Placeholder for new image
            description: "Protect your data and use the internet responsibly",
          },
          {
            title: "Use Tech in Real Life",
            illustration: "/icons/tech-in-life.svg", // Placeholder for new image
            description: "Apply ICT skills to everyday situations like banking, shopping, and GPS",
          },
        ],
      },
    },
    certificate: {
      title: "Proof of Their Brilliance",
      mainText:
        "This certificate is the key that unlocks their next chapter. It's official recognition designed to break down barriers and open new doors.",
      courseDetail: "Successfully completed ICT Course – July 2025",
      bilingualNote: "", // Removed content
      imageAlt: "CTRL-S Certificate Design",
      certificateImage: "/placeholder.svg?height=400&width=600",
    },
    contact: {
      title: "Get in Touch",
      description: "Have questions or ready to enroll? Contact us today!",
      form: {
        name: "Your Name",
        email: "Your Email",
        message: "Your Message",
        submit: "Send Message",
      },
      info: {
        email: "ctrlscourses@gmail.com",
        phone: "+201111123127", // Updated phone number
        whatsappPhone: "+201111123127",
      },
      social: {
        whatsapp: "WhatsApp",
        facebook: "Facebook",
        instagram: "Instagram",
      },
    },
    footer: {
      quickLinks: "Quick Links",
      socialMedia: "Connect With Us",
      copyright: "© 2025 CTRL-S. All rights reserved.",
    },
    common: {
      language: "Language",
      english: "English",
      arabic: "Arabic",
    },
    homeCta: {
      headline: "Ready to empower your child's future?",
      subtext: "Join CTRL-S and start their journey to becoming a confident thinker and builder.",
    },
    enrollment: {
      title: "Choose Your Plan",
      description: "Select the perfect plan to start your child's journey with CTRL-S.",
      plan: {
        name: "ICT Level 1 Program",
        price: "2500 EGP",
        paymentMethod: "Payment via Etisalat Cash",
        cta: "Pay with Etisalat Cash",
        etisalatLink: "https://flous.page.link/hgvp",
      },
    },
    auth: {
      login: {
        title: "Sign In to Your Dashboard",
        description: "Enter your credentials to access your personalized learning content.",
        emailLabel: "Email",
        passwordLabel: "Password",
        signIn: "Sign In",
        signingIn: "Signing In...",
        noAccount: "Don't have an account?",
        signUp: "Sign Up",
      },
      studentDashboard: {
        title: "Student Dashboard",
        signOut: "Sign Out",
        theoreticalContent: "Theoretical Content",
        practicalContent: "Practical Content",
        placeholderText: "Content will appear here.",
        continueWatching: "Continue Watching",
        noVideosWatched: "No videos watched yet. Start exploring!",
        playerPageTitle: "Lecture Player",
        upNext: "Up Next",
      },
      adminDashboard: {
        title: "Admin Dashboard",
        signOut: "Sign Out",
        tabs: {
          dashboard: "Dashboard",
          contentManagement: "Content Management",
          studentManagement: "Student Management",
        },
        stats: {
          totalStudents: "Total Students",
          totalVideos: "Total Videos",
          newSignups30Days: "New Sign-ups (30 Days)",
        },
        contentManagement: {
          addLecture: "+ Add New Lecture",
          editLecture: "Edit Lecture",
          addLectureDescription: "Fill in the details to add a new video lecture.",
          editLectureDescription: "Update the details for this video lecture.",
          table: {
            thumbnail: "Thumbnail",
            lectureTitle: "Lecture Title",
            category: "Category",
            dateAdded: "Date Added",
            actions: "Actions",
          },
          form: {
            lectureTitle: "Lecture Title",
            description: "Description",
            category: "Category",
            thumbnailImage: "Thumbnail Image URL",
            videoSourceUrl: "Video Source URL",
            saveLecture: "Save Lecture",
            addLecture: "Add Lecture",
            theoretical: "Theoretical",
            practical: "Practical",
          },
        },
        studentManagement: {
          createStudentAccount: "+ Create Student Account",
          createStudentAccountDescription: "Fill in the details to create a new student account.",
          table: {
            studentName: "Student Name",
            emailAddress: "Email Address",
            dateRegistered: "Date Registered",
          },
          form: {
            fullName: "Full Name",
            emailAddress: "Email Address",
            password: "Password",
            createAccount: "Create Account",
          },
        },
      },
    },
    lectures: [
      {
        id: "vid1",
        title: "Introduction to Computational Thinking",
        description: "Learn the basics of problem-solving like a computer scientist.",
        thumbnailImage: "/placeholder.svg?height=150&width=250&text=Comp Thinking",
        videoSourceUrl: "https://www.w3schools.com/html/mov_bbb.mp4", // Example video URL
        category: "Theoretical",
        progress: 75, // Added for demo
      },
      {
        id: "vid2",
        title: "Variables and Data Types",
        description: "Understand how to store and manipulate data in programming.",
        thumbnailImage: "/placeholder.svg?height=150&width=250&text=Variables",
        videoSourceUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        category: "Theoretical",
      },
      {
        id: "vid3",
        title: "Loops and Conditionals",
        description: "Master the fundamental control structures in coding.",
        thumbnailImage: "/placeholder.svg?height=150&width=250&text=Loops",
        videoSourceUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        category: "Theoretical",
      },
      {
        id: "vid4",
        title: "Building Your First Scratch Project",
        description: "Hands-on session to create an interactive story in Scratch.",
        thumbnailImage: "/placeholder.svg?height=150&width=250&text=Scratch Project",
        videoSourceUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        category: "Practical",
      },
      {
        id: "vid5",
        title: "Debugging Your Code",
        description: "Learn essential techniques to find and fix errors in your programs.",
        thumbnailImage: "/placeholder.svg?height=150&width=250&text=Debugging",
        videoSourceUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        category: "Practical",
      },
      {
        id: "vid6",
        title: "Advanced Animation Techniques",
        description: "Explore more complex animation principles and tools.",
        thumbnailImage: "/placeholder.svg?height=150&width=250&text=Animation",
        videoSourceUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        category: "Practical",
      },
    ] as VideoLecture[],
  },
  ar: {
    header: {
      logoAlt: "شعار CTRL-S",
      navLinks: [
        { name: "الرئيسية", href: "/#hero" }, // Updated to hash link
        { name: "لماذا CTRL-S", href: "/#why-ctrl-s" }, // Updated to hash link
        { name: "مسار التعلم", href: "/#roadmap" }, // Updated to hash link
        { name: "الشهادة", href: "/#certificate" }, // Updated to hash link
        { name: "اتصل بنا", href: "/contact" },
        { name: "تسجيل الدخول", href: "/auth/login" }, // Added Login link
      ],
      cta: "سجّل الآن",
    },
    hero: {
      headline: "نحن نبني مفكرين، وليس مجرد مبرمجين.",
      subtext: [
        // Changed to array of objects
        { icon: "Brain", text: "بناء عقلية واثقة، فضولية، ومرنة.", highlight: "بناء عقلية" },
        {
          icon: "MessageCircle",
          text: "التدريب على كيفية التصرف من خلال التواصل، حل المشكلات، والتفكير الذكي.",
          highlight: "التدريب على كيفية التصرف",
        },
        {
          icon: "Wrench",
          text: "استخدام التكنولوجيا كأداة لتشكيل المفكرين للهندسة، الطب، أو أي مسار مستقبلي.",
          highlight: "استخدام التكنولوجيا كأداة",
        },
      ],
      cta: "اكتشف الرحلة",
      imageAlt: "رسم توضيحي تقني حديث مع روبوت ودماغ دائرة كهربائية",
    },
    whyCtrlsS: {
      title: "لماذا تختار CTRL-S؟",
      points: [
        {
          icon: "Brain",
          shortTitle: "نحن نبني مفكرين، وليس مجرد مبرمجين.",
          description:
            "نحن لا نُعلّم الطلاب البرمجة فقط، بل نُغيّر طريقتهم في التفكير. نركز أولاً على حل المشكلات والإبداع، لنُعدّهم للتكيّف والابتكار في أي مجال يختارونه، وتكون البرمجة مجرد أداة يستخدمونها لتحويل أفكارهم إلى واقع ملموس.",
          mainFeatureImage: "/why-ctrl-s/Thinkers.png", // New property
        },
        {
          icon: "Users",
          shortTitle: "مهارات شخصية تبني مستقبلهم",
          description:
          "خلف الشاشات، هناك طريقة جديدة للتفكير. في هذه الدورات نُعلّم المهارات الشخصية الأساسية — مثل التفكير المنطقي، وحل المشكلات بطريقة منظمة، والمرونة — وهي مهارات حاسمة للنجاح في أي مسار مستقبلي.",
          mainFeatureImage: "/why-ctrl-s/soft-skills.png", // New property
        },
        {
          icon: "Laptop",
          shortTitle: "مسار مبكر نحو النجاح",
          description:
          "عندما يتعلّم المراهق هذه المهارات في سن مبكرة، يحصل على ميزة حقيقية؛ إذ يدخل إلى دراسته الجامعية وحياته المهنية وهو يمتلك وضوح التفكير، والثقة، والقدرة على حل المشكلات، وهي قدرات لا يبدأ كثير من أقرانه في اكتسابها إلا لاحقًا.",
          mainFeatureImage: "/why-ctrl-s/early-path.png", // New property
        },
        {
          icon: "Map",
          shortTitle: "رحلة تعليمية  يمكنك الوثوق بها",
          description:
          "لا دروس عشوائية، ولا مسارات مربكة. نحن نقدم خارطة طريق تعليمية واضحة، حيث تبني كل خطوة على ما قبلها بطريقة مدروسة. هذا الوضوح يمنح الطالب الثقة والشعور بالتقدم المستمر نحو إتقان مهارات جديدة.",
          mainFeatureImage: "/why-ctrl-s/roadmap.png", // New property
        },
        {
          icon: "Heart",
          shortTitle: "مجتمع تعليمي بروح العائل",
          description:
          "في منصتنا، نعتبر كل طالب جزءًا من عائلتنا. ننمو معهم، نحتفل بإنجازاتهم، وندعمهم في كل التحديات. ليست مجرد دورة تدريبية، بل مجتمع يشعر فيه الطلاب بأنهم مرئيون، مُقدَّرون، ومُلهمون ليصبحوا أفضل نسخة من أنفسهم.",
          mainFeatureImage: "/why-ctrl-s/comunity .png", // New property
        },
      ],
    },
    roadmap: {
      title: "مسار التعلم الخاص بك: مستوى تكنولوجيا المعلومات والاتصالات",
      description:
        "أكثر من مجرد دورة، هذا هو الأساس الضروري للعالم الحديث. نحن نبني إتقانًا رقميًا حقيقيًا، محولين الطلاب إلى خبراء في التطبيقات الأساسية والمعرفة التقنية الأساسية التي يحتاجونها للتفوق بثقة في المدرسة وخارجها.",
      level1: {
        headline: "مستوى تكنولوجيا المعلومات والاتصالات: الأسس العملية والنظرية",
        description:
          "ينقسم مستوى تكنولوجيا المعلومات والاتصالات التأسيسي لدينا إلى جانبين شاملين: المهارات العملية في تطبيقات Microsoft الأساسية والمعرفة النظرية التي تغطي أنظمة الكمبيوتر والشبكات والسلامة والمزيد.",
        modules: [
          {
            title: "إتقان مايكروسوفت أوفيس والتكيف",
            icon: "Laptop", // Icon property remains
            illustration: "/icons/dapt-icon.svg", // Placeholder for new image
            duration: "3 شهور (12 حصة)",
            description: "العمل بثقة مع أدوات أوفيس وتعلم التكنولوجيا الجديدة بسهولة",
          },
          {
            title: "فهم التكنولوجيا الأساسية",
            icon: "Palette", // Icon property remains
            illustration: "/icons/tech.svg", // Placeholder for new image
            duration: "6 شهور (12 حصة)",
            description: "معرفة كيفية عمل الأجهزة والبرامج والشبكات حقًا",
          },
          {
            title: "البقاء آمنًا وذكيًا عبر الإنترنت",
            icon: "Code", // Icon property remains
            illustration: "/icons/stay-safe.svg", // Placeholder for new image
            duration: "9 شهور (12 حصة)",
            description: "حماية بياناتك واستخدام الإنترنت بمسؤولية",
          },
          {
            title: "استخدام التكنولوجيا في الحياة الواقعية",
            icon: "Rocket", // Icon property remains
            illustration: "/icons/tech-in-life.svg", // Placeholder for new image
            duration: "12 شهر (12 حصة)",
         description:
  "تطبيق مهارات تكنولوجيا المعلومات والاتصالات في الحياة اليومية",
          },
        ],
      },
    },
    certificate: {
      title: "شهادة تثبت تميّزهم",
      mainText:
        "هذه الشهادة ليست مجرد ورقة، بل مفتاح حقيقي لفرص جديدة. إنها إثبات رسمي لمهاراتهم، تُكسر بها الحواجز وتُفتح أمامهم الأبواب الأكاديمية والمهنية، وتمنحهم الثقة في بداية فصل جديد من رحلتهم.",
      courseDetail: "أكمل بنجاح دورة تكنولوجيا المعلومات والاتصالات – يوليو 2025",
      bilingualNote: "", // Removed content
      imageAlt: "تصميم شهادة CTRL-S",
      certificateImage: "/placeholder.svg?height=400&width=600",
    },
    contact: {
      title: "تواصل معنا",
      description: "هل لديك أسئلة أو مستعد للتسجيل؟ اتصل بنا اليوم!",
      form: {
        name: "اسمك",
        email: "بريدك الإلكتروني",
        message: "رسالتك",
        submit: "إرسال الرسالة",
      },
      info: {
        email: "ctrlscourses@gmail.com",
        phone: "+201111123127", // Updated phone number
        whatsappPhone: "+201111123127",
      },
      social: {
        whatsapp: "واتساب",
        facebook: "فيسبوك",
        instagram: "انستغرام",
      },
    },
    footer: {
      quickLinks: "روابط سريعة",
      socialMedia: "تواصل معنا",
      copyright: "© 2025 CTRL-S. جميع الحقوق محفوظة.",
    },
    common: {
      language: "اللغة",
      english: "الإنجليزية",
      arabic: "العربية",
    },
    homeCta: {
      headline: "هل أنت مستعد لتمكين مستقبل طفلك؟",
      subtext: "انضم إلى CTRL-S وابدأ رحلتهم ليصبحوا مفكرين وبناة واثقين.",
    },
    enrollment: {
      title: "اختر خطتك",
      description: "اختر الخطة المثالية لبدء رحلة طفلك مع CTRL-S.",
      plan: {
        name: "برنامج مستوى تكنولوجيا المعلومات والاتصالات 1",
        price: "2500 جنيه مصري",
        paymentMethod: "الدفع عبر اتصالات كاش",
        cta: "ادفع باتصالات كاش",
        etisalatLink: "https://flous.page.link/hgvp",
      },
    },
    auth: {
      login: {
        title: "تسجيل الدخول إلى لوحة التحكم الخاصة بك",
        description: "أدخل بيانات الاعتماد الخاصة بك للوصول إلى محتوى التعلم المخصص لك.",
        emailLabel: "البريد الإلكتروني",
        passwordLabel: "كلمة المرور",
        signIn: "تسجيل الدخول",
        signingIn: "جاري تسجيل الدخول...",
        noAccount: "ليس لديك حساب؟",
        signUp: "سجل الآن",
      },
      studentDashboard: {
        title: "لوحة تحكم الطالب",
        signOut: "تسجيل الخروج",
        theoreticalContent: "المحتوى النظري",
        practicalContent: "المحتوى العملي",
        placeholderText: "سيظهر المحتوى هنا.",
        continueWatching: "متابعة المشاهدة",
        noVideosWatched: "لم تتم مشاهدة أي مقاطع فيديو بعد. ابدأ الاستكشاف!",
        playerPageTitle: "مشغل المحاضرات",
        upNext: "التالي",
      },
      adminDashboard: {
        title: "لوحة تحكم المسؤول",
        signOut: "تسجيل الخروج",
        tabs: {
          dashboard: "لوحة القيادة",
          contentManagement: "إدارة المحتوى",
          studentManagement: "إدارة الطلاب",
        },
        stats: {
          totalStudents: "إجمالي الطلاب",
          totalVideos: "إجمالي الفيديوهات",
          newSignups30Days: "تسجيلات جديدة (30 يومًا)",
        },
        contentManagement: {
          addLecture: "+ إضافة محاضرة جديدة",
          editLecture: "تعديل المحاضرة",
          addLectureDescription: "املأ التفاصيل لإضافة محاضرة فيديو جديدة.",
          editLectureDescription: "تحديث تفاصيل محاضرة الفيديو هذه.",
          table: {
            thumbnail: "صورة مصغرة",
            lectureTitle: "عنوان المحاضرة",
            category: "الفئة",
            dateAdded: "تاريخ الإضافة",
            actions: "الإجراءات",
          },
          form: {
            lectureTitle: "عنوان المحاضرة",
            description: "الوصف",
            category: "الفئة",
            thumbnailImage: "رابط الصورة المصغرة",
            videoSourceUrl: "رابط مصدر الفيديو",
            saveLecture: "حفظ المحاضرة",
            addLecture: "إضافة محاضرة",
            theoretical: "نظري",
            practical: "عملي",
          },
        },
        studentManagement: {
          createStudentAccount: "+ إنشاء حساب طالب",
          createStudentAccountDescription: "املأ التفاصيل لإنشاء حساب طالب جديد.",
          table: {
            studentName: "اسم الطالب",
            emailAddress: "عنوان البريد الإلكتروني",
            dateRegistered: "تاريخ التسجيل",
          },
          form: {
            fullName: "الاسم الكامل",
            emailAddress: "عنوان البريد الإلكتروني",
            password: "كلمة المرور",
            createAccount: "إنشاء حساب",
          },
        },
      },
    },
    lectures: [
      {
        id: "vid1",
        title: "مقدمة في التفكير الحاسوبي",
        description: "تعلم أساسيات حل المشكلات كعالم حاسوب.",
        thumbnailImage: "/placeholder.svg?height=150&width=250&text=تفكير حاسوبي",
        videoSourceUrl: "https://www.w3schools.com/html/mov_bbb.mp4", // Example video URL
        category: "Theoretical",
        progress: 75, // Added for demo
      },
      {
        id: "vid2",
        title: "المتغيرات وأنواع البيانات",
        description: "فهم كيفية تخزين ومعالجة البيانات في البرمجة.",
        thumbnailImage: "/placeholder.svg?height=150&width=250&text=المتغيرات",
        videoSourceUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        category: "Theoretical",
      },
      {
        id: "vid3",
        title: "الحلقات والشروط",
        description: "إتقان هياكل التحكم الأساسية في البرمجة.",
        thumbnailImage: "/placeholder.svg?height=150&width=250&text=الحلقات",
        videoSourceUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        category: "Theoretical",
      },
      {
        id: "vid4",
        title: "بناء مشروع سكراتش الأول",
        description: "جلسة عملية لإنشاء قصة تفاعلية في سكراتش.",
        thumbnailImage: "/placeholder.svg?height=150&width=250&text=مشروع سكراتش",
        videoSourceUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        category: "Practical",
      },
      {
        id: "vid5",
        title: "تصحيح الأخطاء في الكود الخاص بك",
        description: "تعلم التقنيات الأساسية للعثور على الأخطاء وإصلاحها في برامجك.",
        thumbnailImage: "/placeholder.svg?height=150&width=250&text=تصحيح الأخطاء",
        videoSourceUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        category: "Practical",
      },
      {
        id: "vid6",
        title: "تقنيات الرسوم المتحركة المتقدمة",
        description: "استكشف مبادئ وأدوات الرسوم المتحركة الأكثر تعقيدًا.",
        thumbnailImage: "/placeholder.svg?height=150&width=250&text=رسوم متحركة",
        videoSourceUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        category: "Practical",
      },
    ] as VideoLecture[],
  },
}

// Define the type for a single video lecture
export type VideoLecture = {
  id: string
  title: string
  description: string
  thumbnailImage: string
  videoSourceUrl: string
  category: "Theoretical" | "Practical"
  progress?: number // Added progress property
}
