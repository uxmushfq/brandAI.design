import { Column, Frame } from "@/components/ui/Frame";
import { unlockHub } from "./actions";

/**
 * The challenge for a password-protected hub.
 *
 * It says as little as possible: the studio's name, so the client knows the link is
 * the one they were sent, and nothing about the brand behind it.
 */
export function PasswordGate({
  slug,
  studioName,
  error,
}: {
  slug: string;
  studioName: string;
  error?: string;
}) {
  return (
    <main className="pt-24 pb-20">
      <Frame>
        <Column>
          <h1 className="text-h1 font-medium">These guidelines are protected</h1>
          <p className="measure mt-4 text-graphite">
            {studioName} set a password on this link. Enter it to see the brand.
          </p>

          <form action={unlockHub} className="mt-8 max-w-sm">
            <input type="hidden" name="slug" value={slug} />
            <label htmlFor="hub-password" className="block text-small">
              Password
            </label>
            <input
              id="hub-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              autoFocus
              className="mt-2 block w-full border border-rule bg-sheet px-3 py-2 text-body"
            />
            {error ? <p className="mt-3 text-small text-alert">{error}</p> : null}
            <button
              type="submit"
              className="mt-5 cursor-pointer bg-ink px-5 py-2.5 text-small text-paper"
            >
              Open guidelines
            </button>
          </form>
        </Column>
      </Frame>
    </main>
  );
}
