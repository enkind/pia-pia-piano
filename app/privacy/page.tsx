import Link from "next/link";
import type { Metadata } from "next";

import "../styles.css";

export const metadata: Metadata = {
  title: "Privacy Policy · Pia Pia Piano",
  description: "What Pia Pia Piano receives, what it stores, and for how long.",
};

export default function Privacy() {
  return (
    <main className="legal">
      <section>
        <h1>Privacy Policy</h1>
        <p className="updated">Last updated 10 November 2026</p>

        <p>
          Pia Pia Piano is a free, noncommercial plugin published by dzhunka. It
          has no accounts, no sign-in, no cookies, and no analytics. This policy
          describes the only data that reaches it.
        </p>

        <h2>What it receives</h2>
        <p>
          Pia Pia Piano exposes one tool, <code>open_piano</code>. When your agent
          calls it, the plugin receives a song title and the melody your agent
          wrote out: a list of notes such as C4 or F#3, each with an optional
          syllable of the lyrics. The plugin has no access to the rest of the
          conversation, to your files, or to anything else your agent holds.
        </p>

        <h2>Your playing</h2>
        <p>
          The piano runs inside a sandboxed frame supplied by your agent host.
          The keys you press, the sound they make, and your progress through the
          song stay in that frame on your device. Nothing you play is sent to Pia
          Pia Piano, to your agent, or to anyone else. The piano does not use
          your microphone.
        </p>
        <p>
          The piano on this website works the same way: the page plays the part
          of the host, and everything stays in your browser.
        </p>

        <h2>What it stores</h2>
        <p>
          Nothing. The server checks that the notes are playable, hands them back
          to your agent host to display, and keeps no copy. There is no database,
          no file store, and no logging of tool payloads. Retention is therefore
          zero: there is nothing to delete, export, or request a copy of.
        </p>

        <h2>Hosting</h2>
        <p>
          The service runs on Vercel, which processes each request in order to
          serve it and records ordinary operational request metadata such as IP
          address, user agent, and timestamp under its own retention defaults.
          Pia Pia Piano does not export, analyse, enrich, or retain that data.
        </p>

        <h2>Who else sees it</h2>
        <p>
          No one. Data is not sold, shared with advertisers, passed to analytics
          providers, or used to train any model. Vercel, as the hosting provider
          described above, is the only third party involved.
        </p>

        <h2>Your controls</h2>
        <p>
          Pia Pia Piano acts only when your agent calls it, and it holds nothing
          afterwards. Uninstalling the plugin from your agent host stops every
          call and leaves nothing behind to erase.
        </p>

        <h2>Changes and contact</h2>
        <p>
          Material changes to this policy will be published on this page with a
          new date. Questions go to{" "}
          <a href="https://github.com/enkind/pia-pia-piano/issues">the public issue tracker</a>.
        </p>

        <p className="back">
          <Link href="/">Back to Pia Pia Piano</Link>
        </p>
      </section>
    </main>
  );
}
