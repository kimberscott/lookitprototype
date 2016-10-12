lookitprototype
=========

Lookit: Online experiments from MIT's Early Childhood Cognition Lab

This is the code for the Lookit prototype used to run several initial test studies on the Lookit site. See lookitWeb/jswcam/ex/ for individual experiment code directories. Within the experiment directory, e.g. lookitWeb/jswcam/ex/ex04, the package.json file indicates which js and css files are loaded for this study. The function main() is called to begin the study.

Completed test studies are:

* ex09 - "Intuitive probability" / oneshot probability, looking time study for infants. Replication of Teglas et al., 2007, using video stimuli courtesy of the authors.

* ex04 - "Learning new verbs" / syntactic bootstrapping, preferential looking study for toddlers. Replication of Yuan & Fisher, 2009, using our own stimuli.

* ex06 - "Learning from others" / trust in testimony, verbal response study for preschoolers. Partial replication of Pasquini et al., 2007, using our own stimuli.

There are also several other test studies in the repo that were used early in testing at the Boston Children's Museum and online but were not continued. For transparency they're included anyway:

* ex03 - speechmatch / intermodal matching of speech videos. An attempt to look for preferential looking / increased looking time to congruent face/speech stimuli (e.g. side-by-side videos of Kim reading different Dr. Seuss stories, with audio from one story played, or single videos of Katy reading short poems with matching or nonmatching audio played). We thought this might be "easier" than classic intermodal matching paradigms, but decided to focus on actual replications when we didn't observe any clear preferences during early piloting at the museum.

* ex07 - learning from statistical evidence, storybook-based verbal response study for preschoolers - replication of Schulz, Bonawitz, & Griffiths, 2007. We started running this at the museum and online, but decided to focus on just one verbal response study to conserve Kim's time. (Also ex04 let us get more data per kid.)

* equality - intermodal matching of duration distributions to size distributions. Translation of a study Kim was trying on a traditional setup in the lab at the time. Decided to focus on replications first to evaluate potential of the Lookit site once it became clear there wasn't enough time to do all the things at once.

If you'd like to use any of the video stimuli included (generally under exNN/videos, exNN/audio, exNN/img) please let us know! We're happy to see them find a new use and may be able to provide you with higher-quality or additional videos than were posted online. They are all ours to give with the exception of...

* The beautiful spinning ball we use as an attentiongrabber. This is courtesy of http://dvdp.tumblr.com/, where you will find a number of other gorgeous animations as well! (Note: not ALL of them are necessarily workplace- or family-friendly.) We recommend contacting the artist directly if you are also interested in using these for infant studies.

* The ex09 videos, courtesy of Teglas et al.
