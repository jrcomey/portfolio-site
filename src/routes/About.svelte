<script>
import { base } from '$app/paths';

let profile_pic = `${base}/assets/profile.JPG`;
</script>

<section class="about-me">
  <div class="shaded-background">
    <div class="about-grid">
      <img src={profile_pic} alt="Profile Picture">
      
      <div class="bio">
        <div>
            <h1>About Me</h1>
        <hr width="100%">
        </div>
         <br>
        <div>
            <p> 
                My name is Jack Comey, and I'm a Guidance, Navigation, and Control Engineer working in the space domain. I graduated from UC Davis in 2021, with double Bachelor's degrees in Mechanical Engineering, and Aerospace Engineering, and have since worked for Lockheed Martin Space in Sunnyvale.
            </p>
        </div>
        <!-- <br> -->
            
            <!-- <p>
                I used the Covid-19 pandemic as an opportunity to improve my academic work and made the Dean's List three times during lockdown. I used the extra time available to take my work to the next level, and my team won the NASA ARMD Aeronautics competition as a part of the result of that.
                Since graduating, I've been at Lockheed Martin Space in Sunnyvale, working on precision motor controls for launch vehicle attitude control systems.
            </p> -->
            
            <!-- <p>
                In 2019, I lead an aircraft design team that competed in SAE Aero Design West, a heavy-lift aircraft design competition that competed last May against teams from a wide variety of nations. 
                Being a part of this team has provided invaluable hands-on design and leadership experience that doesn't typically come from a classroom setting. 
                Unlike many of our competitors, our team has a modest budget and limited personnel, and we've had to find creative ways to overcome our challenges. 
                As a result, I’ve had experience fulfilling ambitious engineering goals in short design cycles, using limited resources and innovative designs both as a design lead, and as an administrative lead for my team.
            </p> -->

            <!-- <p>
                I have years of experience with MATLAB and Python, especially with close-to-the-wire controls design and testing. I've delivered flight code to customers,
                I'm adept with multiple programming languages, such as Matlab, C, and Python, and I have strong communication and interpersonal skills.
            </p> -->

          <p>
              I have a deep passion for civil and commercial spaceflight, and believe it will continue to provide a common benefit for mankind. 
          </p>
            <p>
              <a href="/about">Click here for more.</a>
            </p>
      </div>
    </div>
  </div>
</section>

<style>

  .about-me {
    background-image: url("/assets/windy_hill_forest_1.jpg");
    align-content: center;
    background-size: cover;
    position: relative;
    /* margin: 0% 0%; */
  }


  .shaded-background {
    background-color: #0f1112CC;
    /* display: flex; */
    /* flex-direction: row; */
    padding: 5%;
    border-radius: 2%;
  }

  .about-grid {
    display: grid;
    /* grid-row: 1; */
    grid-template-columns: 3fr 3fr;
    padding: 5%;
    align-items: left;
  }

  @media (max-width: 80em){
    .about-grid {
      display: flex;
      flex-direction: column;
    }
  }

  .about-grid img {
    object-fit: scale-down;
    width: 80%;
    border: 10%;
    border-radius: 10%;
    padding: 5%;
  }

  .bio {
    border: 5%;
    display: flex;
    flex-direction: column;
  }

  .bio h1 {
    line-height: 1.0;
  }
  
</style>