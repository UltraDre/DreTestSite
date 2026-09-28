<script>
	import { page } from '$app/state';
	import Icon from '$comp/Icon.svelte';
</script>

<div class="wrap">
	<div class="card">
		<div class="ico"><Icon name="alert" size={26} /></div>
		<h1>{page.status === 404 ? 'Page not found' : 'Something went wrong'}</h1>
		<p class="muted small">
			{page.status === 404
				? 'That link may have expired or the event may have been removed.'
				: page.error?.message ?? 'Please try again in a moment.'}
		</p>
		<div class="col gap-8" style="margin-top:18px">
			<a class="btn btn-primary btn-block" href="/console">Back to console</a>
			<a class="btn btn-ghost btn-block" href="/">Sign in again</a>
		</div>
		<p class="tiny muted-2" style="margin-top:14px">Error {page.status}</p>
	</div>
</div>

<style>
	.wrap {
		min-height: 100dvh;
		display: grid;
		place-items: center;
		padding: 32px 20px;
	}
	.card {
		max-width: 380px;
		text-align: center;
		background: var(--bg-elev);
		border: 1px solid var(--line);
		border-radius: 22px;
		padding: 28px 22px;
	}
	.ico {
		width: 60px;
		height: 60px;
		border-radius: 99px;
		background: var(--surface);
		display: grid;
		place-items: center;
		margin: 0 auto 14px;
		color: var(--text-2);
	}
	.gap-8 {
		gap: 8px;
	}
</style>
