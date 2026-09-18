"""Rebuild private resume and public research PDFs; requires reportlab."""
from pathlib import Path
import re
from xml.sax.saxutils import escape
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.utils import simpleSplit
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether
from reportlab.lib.pagesizes import letter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output' / 'pdf'
OUT.mkdir(parents=True, exist_ok=True)
INK = colors.HexColor('#172b46')
BLUE = colors.HexColor('#205fa6')
MUTED = colors.HexColor('#52637a')

def ascii_punctuation(text):
    for src, dst in [('—',' - '),('–','-'),('’',"'"),('“','"'),('”','"'),('\u2011','-'),('\u00a0',' ')]:
        text = text.replace(src,dst)
    return text

def inline(text):
    text=escape(ascii_punctuation(text))
    text=re.sub(r'\[([^\]]+)\]\((https?://[^)]+)\)',r'<link href="\2" color="#205fa6">\1</link>',text)
    text=re.sub(r'\*\*(.*?)\*\*',r'<b>\1</b>',text)
    text=re.sub(r'`([^`]+)`',r'<font name="Courier">\1</font>',text)
    return text

def styles(resume=False):
    s=getSampleStyleSheet()
    size=9.1 if resume else 9.7
    s.add(ParagraphStyle(name='Copy',fontName='Helvetica',fontSize=size,leading=size*1.36,textColor=INK,spaceAfter=4 if resume else 6))
    s.add(ParagraphStyle(name='TitleCustom',fontName='Helvetica-Bold',fontSize=24 if resume else 25,leading=28,textColor=INK,spaceAfter=10))
    s.add(ParagraphStyle(name='SectionCustom',fontName='Helvetica-Bold',fontSize=11 if resume else 14,leading=17,textColor=BLUE,spaceBefore=7 if resume else 11,spaceAfter=4 if resume else 6,keepWithNext=True))
    s.add(ParagraphStyle(name='SubCustom',fontName='Helvetica-Bold',fontSize=size,leading=13,textColor=INK,spaceBefore=5 if resume else 8,spaceAfter=4,keepWithNext=True))
    s.add(ParagraphStyle(name='BulletCustom',parent=s['Copy'],leftIndent=9,firstLineIndent=-7,spaceAfter=3))
    s.add(ParagraphStyle(name='SmallCustom',parent=s['Copy'],fontSize=8.4,leading=11,textColor=MUTED))
    s.add(ParagraphStyle(name='CellCustom',parent=s['Copy'],fontSize=8,leading=10.5,spaceAfter=0))
    return s

def footer(canvas,doc):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor('#d8e1ec'))
    canvas.line(42,35,570,35)
    canvas.setFont('Helvetica',8)
    canvas.setFillColor(MUTED)
    canvas.drawString(42,23,doc.title)
    canvas.drawRightString(570,23,str(doc.page))
    canvas.restoreState()

def build(source,destination,title,resume=False):
    text=(ROOT/source).read_text(encoding='utf-8')
    text=re.sub(r'<!--.*?-->','',text,flags=re.S)
    lines=text.splitlines()
    s=styles(resume)
    flow=[]
    i=0
    while i<len(lines):
        line=lines[i].strip()
        if not line: i+=1; continue
        if line.startswith('|'):
            rows=[]
            while i<len(lines) and lines[i].strip().startswith('|'):
                cells=[v.strip() for v in lines[i].strip().strip('|').split('|')]
                if not all(re.fullmatch(r':?-+:?',v) for v in cells):
                    rows.append([Paragraph(inline(v),s['CellCustom']) for v in cells])
                i+=1
            width=528
            n=len(rows[0])
            ratios={5:[.15,.18,.24,.21,.22],4:[.18,.27,.25,.30],2:[.7,.3]}.get(n,[1/n]*n)
            table=Table(rows,colWidths=[width*v for v in ratios],repeatRows=1,hAlign='LEFT')
            table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#e8f0f9')),('VALIGN',(0,0),(-1,-1),'TOP'),('LINEBELOW',(0,0),(-1,-1),.4,colors.HexColor('#d8e1ec')),('LEFTPADDING',(0,0),(-1,-1),6),('RIGHTPADDING',(0,0),(-1,-1),6),('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6)]))
            flow.extend([Spacer(1,5),table,Spacer(1,10)])
            continue
        if line.startswith('# '): flow.append(Paragraph(inline(line[2:]),s['TitleCustom']))
        elif line.startswith('## '): flow.append(Paragraph(inline(line[3:]),s['SectionCustom']))
        elif line.startswith('### '): flow.append(Paragraph(inline(line[4:]),s['SubCustom']))
        elif line.startswith('> '): flow.append(Paragraph(inline(line[2:]),s['SmallCustom']))
        elif line.startswith('- '): flow.append(Paragraph('&#8226; '+inline(line[2:]),s['BulletCustom']))
        elif re.match(r'^\d+\. ',line): flow.append(Paragraph(inline(line),s['BulletCustom']))
        else: flow.append(Paragraph(inline(line),s['Copy']))
        i+=1
    doc=SimpleDocTemplate(str(OUT/destination),pagesize=letter,rightMargin=42,leftMargin=42,topMargin=35,bottomMargin=47,title=title,author='Michael Reeves')
    doc.build(flow,onFirstPage=footer,onLaterPages=footer)
    print(OUT/destination)

build('private/resume.md','Michael-Reeves-Resume.pdf','Michael Reeves | Resume',True)
build('docs/technical-deep-dive.md','Dreambase-Technical-Perspective.pdf','Michael Reeves | Technical perspective')
