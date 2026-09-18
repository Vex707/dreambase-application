# GitHub and application publication

## Prepared locally

The application folder is a Git repository on `application-prep`. Its public artifacts live in `site/`. Private application copy, resume/contact details, and generated local outputs are ignored. A proposed profile README is in `github-profile/README.md`.

The existing vignette repository's remote identifies GitHub account `Vex707`. The accessible browser is currently signed out. No new remote repository, profile update, or public deployment has been created by this package yet.

## Suggested repository

Create `Vex707/dreambase-application` only after confirming the account and reviewing the public files. Do not initialize the remote with a README if pushing this repository. The exact authenticated account and repository URL should be verified before adding an origin.

```powershell
git status --short
git ls-files
# After the intended empty GitHub repository exists:
git remote add origin https://github.com/Vex707/dreambase-application.git
git push -u origin application-prep
```

Never force-push an existing repository for this task. If `origin` already exists, inspect it before changing it. The new repository is separate from the original vignette tool.

## Public portfolio

Publish only the contents of `site/` to the chosen static host. The local preview command is not a production hosting service. A manual workflow is prepared in `.github/workflows/pages.yml`; it tests the domain logic and uploads only `site/` as the Pages artifact. After the reviewed repository is pushed, select GitHub Actions as its Pages source and run “Publish reviewed portfolio” from the repository's default branch. The prepared branch is `application-prep`; make it the default branch or merge the reviewed files into the chosen default before expecting manual workflow dispatch to appear. Links are relative so a repository subpath is supported. The workflow follows [GitHub's documented Pages actions](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), checked September 17, 2026.

After publishing, test the root page, all three demos, CSV download, document links, keyboard navigation, and mobile width while signed out. Only then insert the verified public URL in the email. Upload a narrated video separately and add its actual link; do not use a guessed URL.

## GitHub profile

A GitHub profile README conventionally lives in a public repository with the same name as the account (`Vex707/Vex707`). Review the proposed copy, add the verified application link, and publish it there after checking for an existing profile repository. Pin the application and original project only when their descriptions and contents are ready for review.

## Final application

Private drafts: `private/application-email.md`, `private/linkedin.md`, `private/resume.md`. Add the real LinkedIn and portfolio/video URLs, confirm current facts, and attach the reviewed resume PDF. Drafting does not send an email or update LinkedIn.
