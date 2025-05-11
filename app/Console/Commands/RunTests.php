<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

class RunTests extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:run
                            {--backend : Run only backend tests}
                            {--frontend : Run only frontend tests}
                            {--coverage : Generate coverage reports}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Run backend and frontend tests with coverage';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $backend = $this->option('backend') || (!$this->option('backend') && !$this->option('frontend'));
        $frontend = $this->option('frontend') || (!$this->option('backend') && !$this->option('frontend'));
        $coverage = $this->option('coverage');

        if ($backend) {
            $this->runBackendTests($coverage);
        }

        if ($frontend) {
            $this->runFrontendTests($coverage);
        }

        return Command::SUCCESS;
    }

    /**
     * Run backend tests.
     */
    protected function runBackendTests(bool $coverage): void
    {
        $this->info('Running backend tests...');
        
        $command = $coverage 
            ? ['php', 'artisan', 'test', '--coverage'] 
            : ['php', 'artisan', 'test'];
            
        $process = new Process($command);
        $process->setTty(false);
        
        try {
            $process->start();
            
            foreach ($process as $type => $data) {
                $this->output->write($data);
            }
            
            if ($process->getExitCode() === 0) {
                $this->info('Backend tests completed successfully!');
            } else {
                $this->error('Backend tests failed!');
            }
        } catch (ProcessFailedException $exception) {
            $this->error('Failed to run backend tests: ' . $exception->getMessage());
        }
    }

    /**
     * Run frontend tests.
     */
    protected function runFrontendTests(bool $coverage): void
    {
        $this->info('Running frontend tests...');
        
        $command = $coverage 
            ? ['npm', 'run', 'test', '--', '--coverage'] 
            : ['npm', 'run', 'test'];
            
        $process = new Process($command);
        $process->setTty(false);
        
        try {
            $process->start();
            
            foreach ($process as $type => $data) {
                $this->output->write($data);
            }
            
            if ($process->getExitCode() === 0) {
                $this->info('Frontend tests completed successfully!');
            } else {
                $this->error('Frontend tests failed!');
            }
        } catch (ProcessFailedException $exception) {
            $this->error('Failed to run frontend tests: ' . $exception->getMessage());
        }
    }
}
