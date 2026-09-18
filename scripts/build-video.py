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
 ('portfolio.png','My application to Dreambase','I build tools around practical business workflows.','Verified demo screenshots; synthetic data; no voiceover.'),
 ('metric-blocked.png','Metric Reliability Lab | The wrong answer','Two orders total $150. A line-item join returns $250.','I run real SQL, then compare its result with an independent reference.'),
 ('metric-accepted.png','A repair at the right grain','One row per order preserves the $150 total.','My checks inspect scope, records, grain, amounts, revenue, and freshness.'),
 ('metric-distinct.png','Why SUM DISTINCT is not enough','Two legitimate $100 orders collapse into a single $100 amount.','I test order identity, not just whether a number looks plausible.'),
 ('metric-stale.png','Correct math can still be unusable','The $150 total reconciles, but the snapshot is too old.','I keep freshness explicit and block answers that miss the contract.'),
 ('labels-reviewed.png','Customer report to labels','I separate incomplete addresses and duplicate records before printing.','Format checks establish completeness, not postal deliverability.'),
 ('prospects-reviewed.png','Homeowner prospecting','I filter fictional property records by ZIP and sale-date window.','This public example isolates review and export from live data retrieval.'),
 ('audit-rejected.png','AI audit review | Synthetic replay','I reject unsupported identifiers and incomplete model responses.','No model call occurs. Contract validity cannot establish image accuracy.'),
 ('case-studies.png','My case studies and technical perspective','I connect the problem, implementation decisions, evidence, and limitations.','My recommendations use public Dreambase sources, not internal access.'),
 ('provenance.png','How I prepared this work','I use AI coding assistants and keep synthetic examples separate from workplace data.','I welcome a discussion of the work, tradeoffs, and what I want to learn next.')
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
print('Created local-only 180-second captioned screenshot walkthrough; no voiceover. Publication is currently disabled.')
