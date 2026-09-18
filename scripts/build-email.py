"""Build an unsent email with reviewed attachments; never connects to mail."""
from pathlib import Path
from email.message import EmailMessage
from email.policy import SMTP

root = Path(__file__).resolve().parents[1]
source = (root / 'private/application-email.md').read_text(encoding='utf-8-sig')
content = source.split('\n---\n', 1)[0]
lines = content.splitlines()
message = EmailMessage(policy=SMTP)
message['To'] = next(line[4:] for line in lines if line.startswith('To: '))
message['Subject'] = next(line[9:] for line in lines if line.startswith('Subject: '))
message['X-Unsent'] = '1'
message.set_content('Hi Kyle' + content.split('\nHi Kyle', 1)[1].rstrip() + '\n')
for filename in ['Michael-Reeves-Resume.pdf', 'Dreambase-Technical-Perspective.pdf']:
    message.add_attachment((root/'output/pdf'/filename).read_bytes(),maintype='application',subtype='pdf',filename=filename)
(root/'private/application-email.eml').write_bytes(bytes(message))
print('Unsent email draft rebuilt with resume and technical paper attached.')
