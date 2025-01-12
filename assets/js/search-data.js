// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-strong-neil-strong-rogers",
    title: "<strong>Neil</strong> Rogers",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-ece-343",
          title: "ECE 343",
          description: "Intro to Electromagnetics",
          section: "Navigation",
          handler: () => {
            window.location.href = "/ece343/";
          },
        },{id: "nav-ece-448",
          title: "ECE 448",
          description: "Applications of SDRs",
          section: "Navigation",
          handler: () => {
            window.location.href = "/ece448/";
          },
        },{id: "nav-cv",
          title: "cv",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/cv/";
          },
        },{id: "nav-publications",
          title: "publications",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/publications/";
          },
        },{id: "nav-projects",
          title: "projects",
          description: "A growing collection of your cool projects.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/projects/";
          },
        },{id: "ece343-syllabus",
          title: 'Syllabus',
          description: "[&quot;Start Here&quot;]",
          section: "Ece343",handler: () => {
              window.location.href = "/ece343/0_ece343_syllabus/";
            },},{id: "ece343-course-overview",
          title: 'Course Overview',
          description: "Where are we going?",
          section: "Ece343",handler: () => {
              window.location.href = "/ece343/1_ece343_ch1/";
            },},{id: "ece343-fields",
          title: 'Fields',
          description: "Basic Emag Field Info",
          section: "Ece343",handler: () => {
              window.location.href = "/ece343/2_ece343_ch2/";
            },},{id: "ece343-transmission-lines",
          title: 'Transmission Lines',
          description: "Bridging the gap from circuits to waves",
          section: "Ece343",handler: () => {
              window.location.href = "/ece343/3_ece343_ch3/";
            },},{id: "ece343-electrostatics",
          title: 'Electrostatics',
          description: "Electric fields start somewhere.",
          section: "Ece343",handler: () => {
              window.location.href = "/ece343/4_ece343_ch4/";
            },},{id: "ece448-syllabus",
          title: 'Syllabus',
          description: "Start Here",
          section: "Ece448",handler: () => {
              window.location.href = "/ece448/0_ece448_syllabus_placeholder/";
            },},{id: "news-a-simple-inline-announcement",
          title: 'A simple inline announcement.',
          description: "",
          section: "News",},{id: "news-a-long-announcement-with-details",
          title: 'A long announcement with details',
          description: "",
          section: "News",handler: () => {
              window.location.href = "/news/announcement_2/";
            },},{id: "news-a-simple-inline-announcement-with-markdown-emoji-sparkles-smile",
          title: 'A simple inline announcement with Markdown emoji! :sparkles: :smile:',
          description: "",
          section: "News",},{id: "projects-project-1",
          title: 'project 1',
          description: "with background image",
          section: "Projects",handler: () => {
              window.location.href = "/projects/1_project/";
            },},{id: "projects-project-2",
          title: 'project 2',
          description: "a project with a background image and giscus comments",
          section: "Projects",handler: () => {
              window.location.href = "/projects/2_project/";
            },},{id: "projects-project-3-with-very-long-name",
          title: 'project 3 with very long name',
          description: "a project that redirects to another website",
          section: "Projects",handler: () => {
              window.location.href = "/projects/3_project/";
            },},{id: "projects-project-4",
          title: 'project 4',
          description: "another without an image",
          section: "Projects",handler: () => {
              window.location.href = "/projects/4_project/";
            },},{id: "projects-project-5",
          title: 'project 5',
          description: "a project with a background image",
          section: "Projects",handler: () => {
              window.location.href = "/projects/5_project/";
            },},{id: "projects-project-6",
          title: 'project 6',
          description: "a project with no image",
          section: "Projects",handler: () => {
              window.location.href = "/projects/6_project/";
            },},{id: "projects-project-7",
          title: 'project 7',
          description: "with background image",
          section: "Projects",handler: () => {
              window.location.href = "/projects/7_project/";
            },},{id: "projects-project-8",
          title: 'project 8',
          description: "an other project with a background image and giscus comments",
          section: "Projects",handler: () => {
              window.location.href = "/projects/8_project/";
            },},{id: "projects-project-9",
          title: 'project 9',
          description: "another project with an image 🎉",
          section: "Projects",handler: () => {
              window.location.href = "/projects/9_project/";
            },},{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
