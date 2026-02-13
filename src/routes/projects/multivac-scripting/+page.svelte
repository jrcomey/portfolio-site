<script>
    import Header from '../../Header.svelte';
    import ProjectSection from '$lib/ProjectSection.svelte';
</script>

<Header/>

<section>
    <ProjectSection imagePosition="none">
        <div slot="description">
            <h1>MultiVAC Scripting</h1>
            <hr width="100%">
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
