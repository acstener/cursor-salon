"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-10 bg-background p-4 border-b-2 border-slate-200 dark:border-slate-800 flex flex-row justify-between items-center">
        Convex + Next.js
      </header>
      <main className="p-8 flex flex-col gap-16">
        <h1 className="text-4xl font-bold text-center">Convex + Next.js</h1>
        <Content />
      </main>
    </>
  );
}

function Content() {
  const { viewer, numbers } =
    useQuery(api.myFunctions.listNumbers, {
      count: 10,
    }) ?? {};
  const addNumber = useMutation(api.myFunctions.addNumber);

  if (viewer === undefined || numbers === undefined) {
    return (
      <div className="mx-auto">
        <p>loading... (consider a loading skeleton)</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Welcome {viewer ?? "Anonymous"}!</CardTitle>
          <CardDescription>
            Click the button below and open this page in another window - this data
            is persisted in the Convex cloud database!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => {
              void addNumber({ value: Math.floor(Math.random() * 10) });
            }}
          >
            Add a random number
          </Button>
          <p>
            Numbers:{" "}
            {numbers?.length === 0
              ? "Click the button!"
              : numbers?.join(", ") ?? "..."}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Development Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            Edit{" "}
            <code className="text-sm font-bold font-mono bg-muted px-1 py-0.5 rounded-md">
              convex/myFunctions.ts
            </code>{" "}
            to change your backend
          </p>
          <p>
            Edit{" "}
            <code className="text-sm font-bold font-mono bg-muted px-1 py-0.5 rounded-md">
              app/page.tsx
            </code>{" "}
            to change your frontend
          </p>
          <p>
            See the{" "}
            <Link href="/server" className="underline hover:no-underline">
              /server route
            </Link>{" "}
            for an example of loading data in a server component
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Useful Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ResourceCard
              title="Convex docs"
              description="Read comprehensive documentation for all Convex features."
              href="https://docs.convex.dev/home"
            />
            <ResourceCard
              title="Stack articles"
              description="Learn about best practices, use cases, and more from a growing collection of articles, videos, and walkthroughs."
              href="https://stack.convex.dev"
            />
            <ResourceCard
              title="Templates"
              description="Browse our collection of templates to get started quickly."
              href="https://www.convex.dev/templates"
            />
            <ResourceCard
              title="Discord"
              description="Join our developer community to ask questions, trade tips & tricks, and show off your projects."
              href="https://www.convex.dev/community"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ResourceCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <div className="p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
      <a href={href} className="text-sm font-semibold underline hover:no-underline block mb-2">
        {title}
      </a>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
