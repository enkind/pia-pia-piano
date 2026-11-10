import Link from "next/link";
import type { Metadata } from "next";

import "../styles.css";

export const metadata: Metadata = {
  title: "Terms of Use · Pia Pia Piano",
  description: "The terms under which Pia Pia Piano is offered.",
};

export default function Terms() {
  return (
    <main className="legal">
      <section>
        <h1>Terms of Use</h1>
        <p className="updated">Last updated 10 November 2026</p>

        <p>
          These terms cover the Pia Pia Piano plugin and the service at
          pia-pia-piano.vercel.app, published by dzhunka. Installing or calling
          the plugin means accepting them.
        </p>

        <h2>What the service is</h2>
        <p>
          Pia Pia Piano is a free, noncommercial plugin. It opens a playable
          piano in your agent&apos;s conversation, set up with a melody your
          agent writes out, so you can play the song one key at a time. There is
          no fee, no account, no subscription, and no paid tier.
        </p>

        <h2>The notes</h2>
        <p>
          Your agent writes the melody, not Pia Pia Piano. The plugin checks only
          that each note can be played, so a melody may be simplified,
          transposed, or wrong. Treat it as a way to try a song, not as an
          authoritative score.
        </p>

        <h2>Availability</h2>
        <p>
          The plugin and its endpoint may change, and the service may be
          interrupted or withdrawn at any time without notice. Do not rely on it
          where an interruption would cause harm.
        </p>

        <h2>Acceptable use</h2>
        <p>
          Use the service through a supported agent host, as intended. Do not
          attempt to overload, probe, or disrupt the endpoint, and do not use it
          to infringe someone else&apos;s rights, including the rights in a song.
        </p>

        <h2>No warranty</h2>
        <p>
          The service is provided &ldquo;as is&rdquo; and &ldquo;as
          available&rdquo;, without warranty of any kind, express or implied,
          including fitness for a particular purpose and uninterrupted or
          error-free operation.
        </p>

        <h2>Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, the publisher is not liable for
          any indirect, incidental, or consequential loss arising from use of the
          service.
        </p>

        <h2>Changes and contact</h2>
        <p>
          Updated terms will be published on this page with a new date. Questions
          go to{" "}
          <a href="https://github.com/enkind/pia-pia-piano/issues">the public issue tracker</a>.
        </p>

        <p className="back">
          <Link href="/">Back to Pia Pia Piano</Link>
        </p>
      </section>
    </main>
  );
}
