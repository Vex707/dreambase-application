"""Assemble a captioned walkthrough from real, verified browser screenshots.

This produces a silent screenshot sequence, not a recording of Michael speaking.
Requires FFmpeg with libass. Capture screenshots through the browser tool first.
"""
from pathlib import Path
import shutil
import subprocess

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output'/'video'
OUT.mkdir(parents=True,exist_ok=True)
shots=ROOT/'output'/'screenshots'
scenes=[
 ('portfolio.png','Michael Reeves | Application workbench','Practical business workflows, prepared for Dreambase.','A captioned walkthrough of verified demo screens. Synthetic data; no narration.'),
 ('labels-reviewed.png','Customer report to labels','Six input records: four complete addresses, one incomplete record, one duplicate.','CSV parsing and explicit acceptance rules run locally in the browser.'),
 ('labels-decisions.png','Make rejection reasons visible','Incomplete addresses and repeated households stay out of the print sheet.','This is a new application demo; completeness does not prove deliverability.'),
 ('prospects-reviewed.png','Homeowner prospecting','Filter fictional properties by ZIP code and sale-date window.','Missing prices stay unavailable. Different apartment units remain distinct.'),
 ('audit-valid.png','AI audit review | Synthetic replay','A response must cover every checklist item with supported verdicts and evidence.','No model call occurs. Contract validity does not establish visual accuracy.'),
 ('audit-uncertain.png','Uncertainty needs a review path','One item is reported correct; two require a person to review the evidence.','Low confidence stays visible even when the response is structurally valid.'),
 ('audit-rejected.png','Reject unsupported output','Duplicate and unknown identifiers prevent response acceptance.','The invalid fixture is rejected; no result is silently promoted to trusted state.'),
 ('metric-example.png','The analytics connection','Two orders total $150. A one-to-many join can incorrectly turn that into $250.','Evaluate business meaning and data grain, not only whether a query runs.'),
 ('case-studies.png','Case studies and technical perspective','The write-up connects source evidence, decisions, demos, and limitations.','Recommendations are based on public Dreambase sources, not internal access.'),
 ('provenance.png','Clear provenance | A foundation for discussion','Existing workplace projects are separate from these new AI-assisted samples.','Use the companion script to record your own explanation before submitting.')
]
for file,*_ in scenes:
    if not (shots/file).is_file(): raise FileNotFoundError(shots/file)

def ass_time(n):
    return f'{n//3600}:{(n//60)%60:02}:{n%60:02}.00'

ass='''[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Title,Segoe UI,37,&H00FFFFFF,&H00FFFFFF,&H00172B46,&H00172B46,1,0,0,0,100,100,0,0,1,0,0,8,80,80,19,1
Style: Caption,Segoe UI,31,&H00FFFFFF,&H00FFFFFF,&H00172B46,&H00172B46,0,0,0,0,100,100,0,0,1,0,0,2,70,70,25,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
'''
concat=['ffconcat version 1.0']
srt=[]
for i,(file,title,first,second) in enumerate(scenes):
    start=i*18; end=start+18
    ass+=f'Dialogue: 0,{ass_time(start)},{ass_time(end)},Title,,0,0,0,,{title}\n'
    ass+=f'Dialogue: 0,{ass_time(start)},{ass_time(end)},Caption,,0,0,0,,{first}\\N{second}\n'
    concat += [f"file '{(shots/file).as_posix()}'",'duration 18']
    def st(n): return f'{n//3600:02}:{(n//60)%60:02}:{n%60:02},000'
    srt += [str(i+1),f'{st(start)} --> {st(end)}',title,first,second,'']
concat.append(f"file '{(shots/scenes[-1][0]).as_posix()}'")
(OUT/'walkthrough.ass').write_text(ass,encoding='utf-8')
(OUT/'walkthrough.srt').write_text('\n'.join(srt),encoding='utf-8')
(OUT/'screens.ffconcat').write_text('\n'.join(concat),encoding='utf-8')
ffmpeg=shutil.which('ffmpeg')
if not ffmpeg: raise RuntimeError('FFmpeg is not on PATH.')
command=[ffmpeg,'-hide_banner','-loglevel','warning','-y','-f','concat','-safe','0','-i',str(OUT/'screens.ffconcat'),'-vf',"scale=1690:902:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:70:color=0x172b46,setsar=1,subtitles=output/video/walkthrough.ass",'-t','180','-r','24','-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',str(OUT/'Dreambase-Captioned-Walkthrough.mp4')]
subprocess.run(command,cwd=ROOT,check=True)
public=ROOT/'site'/'media'
public.mkdir(exist_ok=True)
shutil.copy2(OUT/'Dreambase-Captioned-Walkthrough.mp4',public/'walkthrough.mp4')
shutil.copy2(shots/'portfolio.png',public/'portfolio.png')
print('Created 180-second captioned screenshot walkthrough; no voiceover. Public copy: site/media/walkthrough.mp4')
