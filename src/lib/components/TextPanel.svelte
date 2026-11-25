<svelte:options />
<script lang="ts">
type Props = {
    title: string;
    content: string;
    x: number;
    y: number;
    width: number;
    height: number;
};

let { title, content, x, y, width, height }: Props = $props();
</script>

<div
    class="panel"
    style:left="{x}px"
    style:top="{y}px"
    style:width="{width}px"
    style:height="{height}px"
>
    <h2>{title}</h2>
    <p>{content}</p>
</div>

<style>
    .panel {
        position: absolute;
        background: #1e1e1e;
        border: 1px solid #c5a04f;
        border-radius: 8px;
        padding: 16px;
        color: #e6e0d5;
        overflow: auto;
        box-sizing: border-box;
    }

    h2 {
        color: #c5a04f;
        margin-top: 0;
    }
</style>
