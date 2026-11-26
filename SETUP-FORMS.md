# Setting up the Contact and Sponsor forms

The site has two forms: **Contact us** (on the page, on /parents and in the footer) and **Reach out to
sponsor**. What people send is saved in a small database, and the organizers read it in a private
portal at `/portal/`. This guide gets that working. It takes about 15 minutes, and you don't need to
change any code.

You'll need:

- the site's repository on GitHub
- a Vercel account (sign in at [vercel.com](https://vercel.com) with GitHub)

Until steps 2 to 4 are done, the live forms say politely that they aren't set up yet, and nothing is
sent anywhere.

## How it works

- A visitor fills in a form. The site checks it, then saves it in **Upstash Redis**, a database you
  add to the Vercel project from the Vercel Marketplace.
- An organizer opens `/portal/`, types the passcode, and sees every message, newest first. From there
  they can reply (email, call or text links), mark a message as replied, archive it or delete it.
- Nothing on the site links to the portal, and search engines are asked to leave it out. The passcode
  is what keeps it private.

## 1. Deploy the site on Vercel

1. On Vercel, choose **Add New…**, then **Project**.
2. Find the site's repository in the list and choose **Import**. Vercel recognises it as Next.js, so
   keep the settings it suggests.
3. Choose **Deploy** and wait for it to finish. Open the address Vercel gives you (something like
   `your-project.vercel.app`) to check the site loads.

If the site is already on Vercel, skip to step 2.

## 2. Add Upstash Redis

1. Open your project on Vercel and go to the **Storage** tab. Choose **Create Database** (or browse
   the Marketplace), pick **Upstash for Redis**, and continue.
2. Choose the **Free** plan, which is plenty for a hackathon's messages. Give the database a name you'll
   recognise, such as `grandhacks-messages`, and pick a region in the United States. If you're not
   sure, the default region is fine.
3. When Vercel asks which project and environments to connect, choose this project. Keep
   **Production** and **Preview** ticked. You can untick **Development**: your own computer uses a
   test file instead (see [Testing on your computer](#testing-on-your-computer)), so local tests never
   touch the real messages. If Vercel offers a custom prefix for the variables, leave it as it is.
4. Check the result: go to **Settings**, then **Environment Variables**. You should see
   `KV_REST_API_URL` and `KV_REST_API_TOKEN`. Vercel may add a few others too, such as `KV_URL`,
   `REDIS_URL` or `KV_REST_API_READ_ONLY_TOKEN`. The site doesn't use those, and they can stay.

If the two names are different, for example `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`,
that works too. If they have some other prefix, add `KV_REST_API_URL` and `KV_REST_API_TOKEN` yourself
(step 3 shows how), copying in the same two values.

Preview deployments (the ones Vercel builds for branches and pull requests) use the same database, so a
test message sent from a preview shows up in the portal with the real ones. Delete it there when
you're done.

## 3. Add the portal's passcode and secret

Still in **Settings**, then **Environment Variables**, add these two. For each one, type the name under
**Key** and the value under **Value**, tick **Production** and **Preview**, and choose **Save**. You can
also mark them **Sensitive**, so nobody can read them back from the dashboard later.

**`PORTAL_PASSCODE`** is what organizers type to sign in to the portal.

- Make it a long passphrase of at least 12 characters. Four or five unrelated words with spaces or
  dashes between them works well, or let a password manager make one. Don't reuse a password you use
  anywhere else.
- Share it only with the organizers who answer messages, and only privately, for example in a direct
  message, never in a group channel.

**`PORTAL_SECRET`** is a random string of at least 32 characters. Nobody ever types it: the site uses it
to sign the portal's sign-in cookie. Make one with either of these commands, then paste what it prints:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

```sh
openssl rand -base64 32
```

A password manager's generator works too, set to 32 or more characters.

## 4. Redeploy

New or changed variables only reach new deployments. Go to the **Deployments** tab, open the menu (⋯)
on the most recent production deployment, choose **Redeploy**, and wait for it to finish.

Do this again whenever you change any of the variables.

## 5. Open the portal

1. On the live site, press **Contact us** and send yourself a test message.
2. Go to `/portal/` on the same site, for example `https://your-project.vercel.app/portal/`, and
   bookmark it.
3. Type the passcode. You'll see the test message under **New**. Try **Mark as replied**, then
   **Delete** it.

You stay signed in for 12 hours, or until you choose **Sign out**. Five wrong passcodes from one
network pause sign-in from that network for 15 minutes.

## Testing on your computer

You can try both forms and the portal locally without Upstash. Messages are then saved to
`.data/messages.json` in the project folder, which git ignores.

1. Install the project's dependencies once, if you haven't: `npm install`.
2. Create a file called `.env.local` in the project folder with two made-up test values. Git ignores
   `.env.local`, so it stays on your computer. Don't use the real passcode or secret here.

   ```sh
   PORTAL_PASSCODE="a passcode only for testing"
   PORTAL_SECRET="paste-a-random-string-of-32-or-more-characters-here"
   ```

3. Run `npm run dev` and open <http://localhost:3000>. Send a message with **Contact us**, then open
   <http://localhost:3000/portal/> and sign in with your test passcode.

To start again from nothing, delete the `.data` folder. Sending limits and passcode pauses are kept in
memory, so restarting `npm run dev` clears them.

To test the production build instead, add `LOCAL_MESSAGES_FILE=1` as a third line in `.env.local`,
then run `npm run build` and `npm start`. Two things to know:

- `LOCAL_MESSAGES_FILE` is only for your computer. Never add it on Vercel, where a file can't keep
  messages.
- The production build marks the sign-in cookie as secure. Chrome, Edge and Firefox accept that on
  `http://localhost`, but Safari doesn't, so use one of the others for this test (or use
  `npm run dev`).

If you ever put the real `KV_REST_API_URL` and `KV_REST_API_TOKEN` in `.env.local`, your computer reads
and writes the real messages. Take them out again when you're done.

## The variables

| Name | Where | What it's for |
| --- | --- | --- |
| `KV_REST_API_URL` | Vercel, added by Upstash in step 2 | The database's address. |
| `KV_REST_API_TOKEN` | Vercel, added by Upstash in step 2 | The database's password, used only by the site's server. |
| `PORTAL_PASSCODE` | Vercel, added by you in step 3 | What organizers type to sign in. At least 12 characters. |
| `PORTAL_SECRET` | Vercel, added by you in step 3 | Signs the sign-in cookie. Random, at least 32 characters. |
| `LOCAL_MESSAGES_FILE` | Your computer only, optional | Set to `1` to let `npm start` save to `.data/messages.json`. |

## When something's wrong

- **The form says "our forms aren't set up yet."** That deployment can't find `KV_REST_API_URL` and
  `KV_REST_API_TOKEN`. Check the names in step 2, check they're ticked for that environment
  (Production or Preview), then redeploy (step 4).
- **The portal says "Not set up yet."** One of the four variables is missing or too short: the
  passcode needs 12 characters and the secret 32. In Vercel, the project's **Logs** say which, in a
  line that starts "The portal isn't set up." Fix it, then redeploy.
- **"That isn't the passcode."** Check for a stray space or a capital letter. After five wrong tries,
  wait 15 minutes.
- **The passcode is right, but you land back on the sign-in screen.** The browser didn't keep the
  sign-in cookie. Allow cookies for the site, or try a normal (not private) window.
- **A visitor sees "You've sent a few messages in a short time."** Each network can send about five
  messages every ten minutes. A school or a library shares one network, so many people sending at
  once can hit this. They can try again a few minutes later.
- **"Something went wrong on our side."** The database didn't answer. Check that Upstash is connected
  under the **Storage** tab, and look in **Logs** for a line starting "A message couldn't be saved."

To sign everyone out at once, for example if someone leaves the team or loses a laptop that was signed
in, change `PORTAL_SECRET` (and the passcode, if they knew it), then redeploy. Signing out on one
device removes its cookie but doesn't end sessions on other devices.

## Looking after the messages

Parents may write about their child's health, allergies or needs, so treat the portal as private.

- **What's kept:** the name (if given), the role or organization, how to reach them, the message, the
  sponsor choices, the time it was sent, and its status.
- **What isn't kept:** the visitor's network (IP) address, except in counters that delete themselves
  after 10 to 15 minutes, the name typed on the name tag, and anything in the visitor's browser.
- Messages stay in Upstash until you delete them. Once a message is answered and you no longer need
  it, delete it in the portal.
- Only organizers who answer messages need the passcode. Change it when the team changes.
- To see the raw data, the database's page under **Storage** has a data browser. Messages are in the
  `gh:messages` key and their statuses in `gh:status`.

## Changing things

- **Wording** of the forms, the portal and their messages: `app/content.ts`, in `forms`, `panels` and
  `portal`.
- **An "Email us" link** under the Contact form: put a `mailto:` link in `links.contact` in
  `app/content.ts`.
- **Limits:** messages per network in `app/api/messages/route.ts` (`SENDS`, `WINDOW`), passcode tries
  and the pause in `app/api/portal/session/route.ts` (`TRIES`, `PAUSE`), and how long a sign-in lasts in
  `app/lib/portal.ts` (`SESSION`).
