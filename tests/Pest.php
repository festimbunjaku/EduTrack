<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a specific PHPUnit test
| case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
| need to change it using the "uses()" function to bind a different classes or traits.
|
*/

uses(
    Tests\TestCase::class,
    RefreshDatabase::class,
)->in('Feature');

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
|
| When you're writing tests, you often need to check that values meet certain conditions. The
| "expect()" function gives you access to a set of "expectations" methods that you can use
| to assert different things. Of course, you may extend the Expectation API at any time.
|
*/

expect()->extend('toBeRedirectedTo', function (string $url) {
    $actual = $this->value->headers->get('Location');
    expect($actual)->toBe($url);
    return $this;
});

expect()->extend('toHaveInertiaComponent', function (string $component) {
    $this->value->assertInertia(fn (Assert $page) => $page->component($component));
    return $this;
});

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
|
| While Pest is very powerful out-of-the-box, you may have some testing code you need to run
| for your specific project. Feel free to add your own functions to the mix here.
|
*/

function createUserWithRole(string $role)
{
    $user = User::factory()->create();
    $user->assignRole($role);
    return $user;
}

function createTestTeacher()
{
    return createUserWithRole('teacher');
}

function createTestStudent()
{
    return createUserWithRole('student');
}

function createTestAdmin()
{
    return createUserWithRole('admin');
}
