import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, ValidatorFn, AbstractControl, FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { Select } from 'primeng/select';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    InputTextModule,
    ButtonModule,
    MessageModule,
    ReactiveFormsModule,
    FormsModule,
    TableModule,
    Select,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  registrationForm: FormGroup;
  users: Array<{ firstName: string; lastName: string; email: string; university: string }> = [];
  universities = [
    { label: 'Harvard University', value: 'Harvard University' },
    { label: 'Stanford University', value: 'Stanford University' },
    { label: 'MIT', value: 'MIT' },
    { label: 'Oxford University', value: 'Oxford University' },
    { label: 'Cambridge University', value: 'Cambridge University' },
    { label: 'Yale University', value: 'Yale University' },
    { label: 'Princeton University', value: 'Princeton University' }
  ];

  firstNameFilter = '';
  lastNameFilter = '';
  emailFilter = '';
  universityFilter: string | null = null;

  allowedDomains = ['edu.com', 'university.edu'];

  constructor(private fb: FormBuilder) {
    this.registrationForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email, this.allowedDomainValidator(this.allowedDomains)]],
      university: ['', [Validators.required]]
    });
  }

  allowedDomainValidator(domains: string[]): ValidatorFn {
    return (control: AbstractControl) => {
      const email = control.value;
      if (!email) return null;

      const domain = email.substring(email.lastIndexOf('@') + 1).toLowerCase();
      const isAllowed = domains.some((d) => domain === d.toLowerCase());

      return isAllowed ? null : { domain: true };
    };
  }

  onSubmit() {
    if (this.registrationForm.valid) {
      const emailExists = this.users.some(u => u.email === this.registrationForm.value.email);
      if (emailExists) {
        this.registrationForm.get('email')?.setErrors({ duplicate: true });
        return;
      }

      this.users.push(this.registrationForm.value);
      console.log('User added:', this.registrationForm.value);
      console.log('All users:', this.users);
      this.registrationForm.reset();
    } else {
      this.registrationForm.markAllAsTouched();
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.registrationForm.get(fieldName);
    console.log(field?.errors)
    if (field?.touched && field?.invalid) {
      if (field.errors?.['required']) {
        return 'This field is required';
      }
      if (field.errors?.['minlength']) {
        return 'Minimum length is 2 characters';
      }
      if (field.errors?.['email']) {
        return 'Please enter a valid email';
      }
      if (field.errors?.['domain']) {
        return 'Email domain not allowed';
      }
      if (field.errors?.['duplicate']) {
        return 'This email is already registered.';
      }
    }
    return '';
  }

  removeUser(index: number, email: string): void {
    const confirmed = window.confirm(`Are you sure you want to delete the user with email: ${email}?`);
    if (confirmed) {
      this.users.splice(index, 1);
      console.log(`Deleted user with email: ${email}`);
    } else {
      console.log('User deletion cancelled.');
    }
  }

  get filteredUsers() {
    return this.users.filter(user => {
      const matchesFirst =
        !this.firstNameFilter ||
        user.firstName.toLowerCase().includes(this.firstNameFilter.toLowerCase());
      const matchesLast =
        !this.lastNameFilter ||
        user.lastName.toLowerCase().includes(this.lastNameFilter.toLowerCase());
      const matchesEmail =
        !this.emailFilter ||
        user.email.toLowerCase().includes(this.emailFilter.toLowerCase());
      const matchesUniversity =
        !this.universityFilter || user.university === this.universityFilter;

      return matchesFirst && matchesLast && matchesEmail && matchesUniversity;
    });
  }
}
