<?php

namespace App\Http\Controllers;

use App\Enums\NotificationType;
use App\Mail\MailCommandSchedule;
use App\Models\CommandSchedule;
use Carbon\Carbon;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\App;
use App\Helpers\EmailHelper;

class CommandController extends Controller
{
    public function runCommand(CommandSchedule $command): void
    {
        $output = "";

        try {
            set_error_handler(null);
            Artisan::call($command->command);
        } catch (\Throwable $e) {
            $output = "ERROR: \n" . $e->getMessage() . "\n" . $e->getTraceAsString();

            $locale = config('app.locale');
            $this->sendEmailNotification($command->command, $e->getMessage(), $locale);
        }
        restore_error_handler();

        $artisanOutput = Artisan::output();

        if ($artisanOutput) {
            if ($output) {
                $output .= "\n";
            }

            $output .=  "COMMAND OUTPUT: \n" . $artisanOutput;
        }

        $command->last_run_at = Carbon::now();
        $command->last_output = $output;
        $command->save();
    }

    public function sendEmailNotification($errorCommand, $errorMessage, $lang)
    {
        App::setLocale($lang);
        $emailHelper = new EmailHelper();

        // Set up mail data
        $mailData = [
            'to' => $emailHelper->getEmailsByNotificationType(NotificationType::SCHEDULED_COMMAND_IS_FAILED()),
            'subject' => __('messages.importFailed.subject'),
            'content' => __('messages.importFailed.sectionTwo', [
                'command' => $errorCommand,
                'execution_time' => Carbon::now()->format('Y-m-d H:i:s'),
                'errorMessage' => $errorMessage,
            ]),
        ];

        $mailInfo = [
            'subject' => $mailData['subject'],
            'content' => nl2br($mailData['content']),
        ];

        // Use the helper method to send the email
        return $emailHelper->sendEmail(
            'smtp',
            $mailInfo,
            $mailData['to'],
            MailCommandSchedule::class,
            $mailData['Cc'] ?? []
        );
    }

    public function calculateWorkload()
    {
        // Get the first matching CommandSchedule model
        $commandSchedule = CommandSchedule::where('command', 'machine-output:calculate')->first();

        if (!$commandSchedule) {
            return response()->json([
                'success' => false,
                'message' => 'No matching command found in the database.',
            ], 404);
        }

        return $this->runCommand($commandSchedule);
    }
}
