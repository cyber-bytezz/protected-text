import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";

export default function HowToUse() {
  const steps = [
    {
      title: "Step 1",
      description: "Create your own notepad at Encrypt.com/your-name.",
    },
    {
      title: "Step 2",
      description: "Set a password and start writing notes",
    },
    {
      title: "Step 3",
      description: "Save and close the tab once you are done!",
    },
  ];

  return (
    <div className="flex justify-center items-center">
    <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-10 w-[1000px]">
        {steps.map((step, index) => (
          <Card key={index} className="w-full max-w-sm h-48">
            <CardContent className="flex flex-col mt-10 p-6 text-center h-full">
              <h2 className="text-2xl font-bold">{step.title}</h2>
              <p className="mt-2 text-sm text-gray-600">{step.description}</p>
            </CardContent>
          </Card>
        ))}
    </div>      
    </div>
  );
}
