export function HowItWorks() {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4 font-mono">$ cat how_it_works.txt</h2>
      <ol className="list-decimal list-inside space-y-2 text-gray-400">
        <li>Sign up for SecretAgent and create a project</li>
        <li>Add your secrets to the project</li>
        <li>Add your agents to the project</li>
        <li>Add our integration to your agents</li>
        <li>Deploy your agents with confidence, knowing your keys are secure</li>
        <li>Monitor usage, rotate keys, and manage access in real-time</li>
      </ol>
    </section>
  );
}
