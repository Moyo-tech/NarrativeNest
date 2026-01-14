'use client'

import { Action, ActionIconMap, DefaultActions } from "@/types/data";
import Link from "next/link";
import { useEffect, useState } from "react";
import {FiArrowRight, FiCloud, FiFeather, FiFile, FiFileText, FiGlobe, FiGrid, FiHash, FiMinus, FiPlus, FiShuffle, FiType, FiZap} from "react-icons/fi"
import Markdown from 'react-markdown'

export default function HomeClient() {

  const useCases = [
    {
      role: "Data Scientist",
      global: `
You are an assistant helping a user write a document. Follow the user's instructions carefully. Respond using markdown.

X corp is a leading ride hailing and food delivery platform. You're a data scientist working in the Growth team at X corp. X corp employees are called Xers. Key business metrics are MTU (Monthly Transacting Users) and MAU (Monthy Active User).
`,
      documents: [{
        name: "Q4 OKRs",
        document: `
You're writing OKRs for Q4 2023. Clearly structure each OKR with following elements: Objective, Key Results, Metrics, Initiatives and Timeline.

Keep descriptions short and concise to 2-3 sentences. Emphasize the impact of the OKR and add relevant metrics to justify the impact. Write it in first person.
`,
        action: "expand",
        context: `Write OKRs for:
1. churn prediction
2. dynamic product ads.
`,
        output: `
# Objective: Churn Prediction

## Key Results:

1.  Achieve a churn prediction accuracy of 90% by the end of Q4 2023, as measured by the F1 score.
2.  Reduce customer churn rate by 20% by the end of Q4 2023, as measured by the number of customers who have stopped using our services.
3.  Increase customer retention rate by 15% by the end of Q4 2023, as measured by the number of customers who continue to use our services.

## Metrics:

1.  F1 score: This metric measures the accuracy of our churn prediction model, taking into account both precision and recall. A higher F1 score indicates better accuracy in identifying customers who are likely to churn.
2.  Churn rate: This metric measures the percentage of customers who have stopped using our services during a specific time period. A lower churn rate indicates higher customer loyalty and satisfaction.
3.  Retention rate: This metric measures the percentage of customers who continue to use our services over a specific time period. A higher retention rate indicates better customer engagement and loyalty.

## Initiatives:

1.  Improve data collection and preprocessing: Enhance the quality and completeness of customer data, ensuring that relevant information is captured accurately to train the churn prediction model.
2.  Develop advanced machine learning models: Explore and implement state-of-the-art machine learning algorithms to improve the accuracy of churn prediction and identify key factors contributing to customer churn.
3.  Personalize customer engagement: Utilize the churn prediction model to develop targeted retention strategies, such as personalized offers and incentives, to proactively engage customers who are at risk of churning.

## Timeline:

-   Q4 2023: Implement data collection and preprocessing improvements.
-   Q4 2023: Develop and deploy advanced machine learning models for churn prediction.
-   Q4 2023: Launch personalized customer engagement initiatives based on churn prediction insights.

# Objective: Dynamic Product Ads

## Key Results:

1.  Increase click-through rate (CTR) of dynamic product ads by 25% by the end of Q4 2023, as measured by the percentage of users who click on the ads.
2.  Improve conversion rate of dynamic product ads by 15% by the end of Q4 2023, as measured by the percentage of users who make a purchase after clicking on the ads.
3.  Increase revenue generated from dynamic product ads by 20% by the end of Q4 2023, as measured by the total sales attributed to dynamic product ads.

## Metrics:

1.  Click-through rate (CTR): This metric measures the percentage of users who click on the dynamic product ads after viewing them. A higher CTR indicates better engagement and interest from users.
2.  Conversion rate: This metric measures the percentage of users who make a purchase after clicking on the dynamic product ads. A higher conversion rate indicates the effectiveness of the ads in driving user actions.
3.  Revenue generated: This metric measures the total sales generated from the purchases made by users who clicked on the dynamic product ads. Increased revenue indicates the impact of the ads on driving business growth.

## Initiatives:

1.  Improve ad targeting and personalization: Utilize user data and browsing behavior to create more relevant and personalized dynamic product ads, increasing the likelihood of user engagement and conversions.
2.  Optimize ad placement and design: Test and iterate on different ad placements and designs to identify the most effective formats and layouts that capture user attention and encourage clicks.
3.  Implement real-time product updates: Develop a system that ensures the dynamic product ads are always up-to-date with the latest inventory and pricing information, providing users with accurate and relevant product recommendations.

## Timeline:

-   Q4 2023: Implement improved ad targeting and personalization strategies.
-   Q4 2023: Conduct A/B testing to optimize ad placement and design.
-   Q4 2023: Deploy real-time product updates for dynamic product ads.
`
    },{
      name: "Slack messages",
      document: "You're writing a Slack message. Use a friendly semi-formal tone and don't be overly formal. Be a little witty and concise. Try to keep messages to 2-3 sentences.",
      action: "expand",
      context: "Our airflow instance is down, expect delayed business reports",
      output: "Hey Xers! Just a heads up, our airflow instance is currently down so we might experience some delays with our business reports. Hang tight, we're working on getting it back up and running ASAP!"
    },{
      name: "Announcements",
      document: "**Use emphatetic tone**. Use corporate professional language.",
      action: "expand",
      context: "Our airflow instance is down, expect delayed business reports",
      output: `
Dear Xers,

I hope this message finds you well. I wanted to inform you that our airflow instance, which is crucial for generating our business reports, is currently experiencing technical difficulties and is temporarily down. As a result, there may be a delay in receiving the reports that we rely on for critical business insights.

We understand the importance of these reports in making informed decisions and tracking our progress as a company. Rest assured, our dedicated team of IT professionals is working diligently to resolve the issue and restore the airflow instance as soon as possible.

In the meantime, we kindly ask for your patience and understanding. We recognize that this situation may cause some inconvenience, but please know that we are doing everything in our power to minimize any disruption to our operations.

We would like to assure you that this incident serves as a reminder of the importance of our technological infrastructure and the need for continuous improvements to prevent such occurrences in the future. We are committed to investing in the necessary resources and systems to enhance the stability and reliability of our platforms.

Once the airflow instance is back up and running, we will expedite the generation of the delayed reports to ensure that you have the most up-to-date information at your disposal. We will also keep you informed of any developments or updates regarding this matter.

Thank you for your understanding and cooperation during this time. We truly appreciate your commitment and dedication to our company's growth. If you have any questions or concerns, please do not hesitate to reach out to our IT support team.

Best regards,

[Your Name]
Data Scientist, Growth Team
`
    },{
      name: "Project Herculean",
      document: "Project Herculean is an initiative to migrate all our Kubernetes clusters from AWS to GCP. Person In Charge for this project as below:\n\n- Product Manager: James Anderson\n\n- Platform Engineering: Thomas Jefferson",
      action: "expand",
      context: "For details regarding the timelines, talk to the PM",
      output: "If you need more information about the specific timelines for Project Herculean, I recommend reaching out to the Product Manager, James Anderson. He will be able to provide you with the necessary details and answer any questions you may have. It is important to stay informed about the project's progress and deadlines to ensure its successful execution. Feel free to reach out to James for any further clarification or updates."
    }]
  }]

  const [ucIndex, setucIndex] = useState(0)

  const renderIcon = (task_id: string) => {
    let task : Action | undefined;
    for (let i = 0; i < DefaultActions.length; i++) {
      const t = DefaultActions[i];
      if(t.id == task_id){
        task = t
        break
      }
    }

    if (!task) return null;

    let icon: keyof typeof ActionIconMap = 'custom'
    if(task.id in ActionIconMap){
      icon = task.id as keyof typeof ActionIconMap
    }
    const Icon = ActionIconMap[icon];
    return (<div>
      <div className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg mr-8 ">
      <Icon width="1.125em" height="1.125em" className="mr-2 text-gray-800" />{task.name}</div>
      <div className="mt-4">{task.prompt}</div>
      </div>);
  };

  function tabClass(current: number, active: number){
    let c = 'mr-4 mb-4 px-8 py-4 cursor-pointer items-center rounded-lg '
    if(current == active){
        c += ' bg-sky-100 text-blue-800 font-semibold'
    }else{
        c += ' bg-gray-50 hover:bg-gray-200 text-gray-600 '
    }
    return c
  }

  const [output, setOutput] = useState("");

  let interval: ReturnType<typeof setInterval>;
  function handleTabClick(uc: number){
    setucIndex(uc)
  }

  useEffect(() => {
    const words = useCases[0].documents[ucIndex].output?.split(" ");
    let currentIndex = 0;
    setOutput(words[currentIndex])
    interval = setInterval(() => {
      if (currentIndex < words.length -1) {
        setOutput(prevOutput => prevOutput + " " + words[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 10);

    return () => {
      clearInterval(interval);
    }
  }, [ucIndex]);

  return (<>
  <header className="animate-header-slide-down-fade sticky top-0 border-b border-transparent backdrop-blur-sm transition duration-200 ease-in-out z-10">
  <div className="mx-auto w-full max-w-5xl px-6 md:max-w-7xl">
    <div className="mx-auto hidden h-[58px] w-full items-center justify-between transition duration-500 ease-in-out md:flex">
      <div className="flex lg:w-[225px]">
        <Link className="focus-visible:ring-slate-7 py-1 outline-none transition duration-150 ease-in-out focus-visible:ring-2 text-2xl font-semibold" aria-label="Resend" href="/">NarrativeNest</Link>
      </div>
      <div className="flex gap-4">
        <Link className="inline-flex h-10 select-none items-center justify-center gap-0 rounded-lg border border-gray-800 hover:border-sky-900 hover:bg-sky-900 bg-gray-900 text-white px-4 text-sm font-semibold outline-none transition transition duration-150 duration-200 ease-in-out ease-in-out" href="/editor">Try NrrativeNest</Link>
      </div>
    </div>
  </div>
</header>

<main
      className={`mx-auto max-w-6xl`}>



      <div className="my-12 text-center">
        <h1 className='text-5xl font-semibold text-gray-900'>AI Powered Screenwriting and Storyboarding Tool</h1>
        {/* ChatGPT workbench for power users */}
        <h2 className='text-2xl mt-4 text-gray-600'>Revolutionizing Nollywood Narratives</h2>
        {/* <h2 className='text-4xl font-semibold mt-4 text-gray-600'>SQL workbench equivalent of ChatGPT</h2> */}

        <p className="text-2xl text-gray-700 py-8">Experience a fully integrated workflow for brainstorming, writing and visualising with ChatGPT and Stable Diffusion as your copilot, all within the same software</p>

        <Link className="inline-block text-2xl justify-center mt-4 py-4 px-6 transition-colors border border-gray-800 hover:border-sky-900 hover:bg-sky-900 bg-gray-900 text-white rounded-lg mr-4" href="/editor">Try NarrativeNest</Link>

      </div>

      <footer className="mb-40"></footer>
    </main>
  </>
  )
}
