USE e_scuela_db;

ALTER TABLE enrollments
    DROP FOREIGN KEY enrollments_ibfk_1;

ALTER TABLE grades
    DROP FOREIGN KEY grades_ibfk_1;

ALTER TABLE grades
    DROP FOREIGN KEY grades_ibfk_2;

ALTER TABLE students
    DROP FOREIGN KEY students_ibfk_1;

ALTER TABLE enrollments
    ADD CONSTRAINT fk_e_scuela_enrollments_student
        FOREIGN KEY (student_id) REFERENCES students(student_id)
        ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE grades
    ADD CONSTRAINT fk_e_scuela_grades_student
        FOREIGN KEY (student_id) REFERENCES students(student_id)
        ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE grades
    ADD CONSTRAINT fk_e_scuela_grades_subject
        FOREIGN KEY (subject_id) REFERENCES subjects(id)
        ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE students
    ADD CONSTRAINT fk_e_scuela_students_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE;
