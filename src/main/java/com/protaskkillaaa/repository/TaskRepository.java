package com.protaskkillaaa.repository;

import com.protaskkillaaa.domain.Task;
import java.util.List;
import java.time.Instant;
import com.protaskkillaaa.domain.enumeration.TaskStatus;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
/**
 * Spring Data JPA repository for the Task entity.
 */
@SuppressWarnings("unused")
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    @Query("select task from Task task where task.assignedTo.login = ?#{authentication.name}")
    List<Task> findByAssignedToIsCurrentUser();
    Long countByAssignedTo_Login(String login);

    Long countByStatusAndAssignedTo_Login(TaskStatus status, String login);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.status = :status AND t.createdAt >= :startDate AND t.createdAt < :endDate AND t.assignedTo.login = :login")
    Long countByStatusAndCreatedAtBetweenAndAssignedTo_Login(TaskStatus status, Instant startDate, Instant endDate, String login);
}
