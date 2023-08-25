<script>

let profile_pic = "src/assets/profile.JPG";
</script>

<section class="about-me">
  <div class="shaded-background">
    <div class="about-grid">
      <img src={profile_pic} alt="Profile Picture">
      
      <div class="bio">
        <h1>About Me</h1>
            <p> 
                My name is Jack Comey, and I'm a Guidance, Navigation, and Controls Engineer in the San Francisco Bay Area, working in the space domain. I graduated from UC Davis in 2021, with a double Bachelor's degree in Aerospace Science and Engineering, and Mechanical Engineering. 
            </p>
            <p>
                I used the Covid-19 pandemic as an opportunity to improve my academic work and made the Dean's List three times during lockdown. I used the extra time available to take my work to the next level, and my team won the NASA ARMD Aeronautics competition as a part of the result of that.
                Since graduating, I've been at Lockheed Martin Space in Sunnyvale, working on precision motor controls for launch vehicle attitude control systems.
            </p>
            
            <!-- <p>
                In 2019, I lead an aircraft design team that competed in SAE Aero Design West, a heavy-lift aircraft design competition that competed last May against teams from a wide variety of nations. 
                Being a part of this team has provided invaluable hands-on design and leadership experience that doesn't typically come from a classroom setting. 
                Unlike many of our competitors, our team has a modest budget and limited personnel, and we've had to find creative ways to overcome our challenges. 
                As a result, I’ve had experience fulfilling ambitious engineering goals in short design cycles, using limited resources and innovative designs both as a design lead, and as an administrative lead for my team.
            </p> -->

            <p>
                I have years of experience with MATLAB and Python, especially with close-to-the-wire controls design and testing. I've delivered flight code to customers,
                I'm adept with multiple programming languages, such as Matlab, C, and Python, and I have strong communication and interpersonal skills.
            </p>
            <p>
              <a href="/about">To learn more about how I work and think, click here</a>
            </p>
            <p>
              All work shown on this website is either fully my own, or was collaborative work as part of my undergraduate degree.
            </p>
      </div>
    </div>
    
    
  </div>
    <!-- <div class="wave">
      <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" class="shape-fill"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" class="shape-fill"></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" class="shape-fill"></path>
      </svg>
    </div> -->
</section>

<style>

  .about-me {
    background-image: url("./src/assets/windy_hill_forest_1.jpg");
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
    font-variant: small-caps;
    text-decoration: underline;
  }
  
</style>