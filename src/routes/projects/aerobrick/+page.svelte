<script>
    import Header from '../../Header.svelte';
    import ProjectSection from '$lib/ProjectSection.svelte';
</script>

<Header/>

<section>
    <ProjectSection imagePosition="none">
        <div slot="description">
            <h1>Aerobrick</h1>
            <h3>SAE Aero Design West - Regular Division</h3>
            <hr width="100%">
            <p>I was Team Captain of a heavy-lift aircraft design team that competed in SAE Aero Design West's Regular division.</p>
            <p>My design, compared to the team's previous entry, reduced manufacture cost by 83% through use of recycled materials, while reducing parasite drag by 30% through improved wing and fuselage geometry.</p>
            <p><i>This page is under construction.</i></p>
        </div>
    </ProjectSection>
</section>

<style>
    section {
        background-size: cover;
        position: relative;
        z-index: -10;
        min-height: 90vh;
        display: flex;
        flex-direction: column;
    }
</style>