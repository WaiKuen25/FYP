import React, { useState, useEffect } from 'react';
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { Badge } from '@mui/material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Fab,
  Chip,
  Card,
  CardContent,
  Collapse,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon,
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  PlayCircleFilled as PlayCircleFilledIcon,
  AccessTime as AccessTimeIcon,
  Description as DescriptionIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import axios from 'axios';
import { format, isWithinInterval, isSameDay, startOfDay, endOfDay, isAfter, isBefore } from 'date-fns';
import { enUS } from 'date-fns/locale';

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    startTime: new Date(),
    endTime: new Date(),
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/calendar/tasks`,
        {
          headers: {
            AdminAuthorization: `Bearer ${localStorage.getItem('admintoken')}`,
          },
        }
      );
      if (response.data.success) {
        const sortedTasks = response.data.tasks.sort((a, b) => 
          new Date(a.startTime) - new Date(b.startTime)
        );
        setEvents(sortedTasks);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  // Get event status
  const getEventStatus = (startTime, endTime) => {
    const now = new Date();
    if (isAfter(now, new Date(endTime))) {
      return { label: 'Completed', color: 'success', icon: <CheckCircleIcon /> };
    }
    if (isWithinInterval(now, { start: new Date(startTime), end: new Date(endTime) })) {
      return { label: 'In Progress', color: 'warning', icon: <PlayCircleFilledIcon /> };
    }
    return { label: 'Upcoming', color: 'info', icon: <ScheduleIcon /> };
  };

  // Custom day rendering
  const CustomDay = (props) => {
    const { day, outsideCurrentMonth, ...other } = props;
    const hasDeadline = events.some(event => 
      isSameDay(new Date(event.endTime), day)
    );

    return (
      <Badge
        key={props.day.toString()}
        overlap="circular"
        badgeContent={hasDeadline ? (
          <EventIcon 
            color="error" 
            fontSize="small" 
            sx={{ 
              backgroundColor: '#fff',
              borderRadius: '50%',
              padding: '2px'
            }} 
          />
        ) : undefined}
      >
        <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
      </Badge>
    );
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setExpandedEventId(null); // Reset expanded state
  };

  const handleExpandClick = (eventId) => {
    setExpandedEventId(expandedEventId === eventId ? null : eventId);
  };

  const getDayEvents = (date) => {
    return events.filter(event => 
      isWithinInterval(date, {
        start: startOfDay(new Date(event.startTime)),
        end: endOfDay(new Date(event.endTime))
      })
    );
  };

  const getTimeStatus = (event) => {
    const now = new Date();
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);
    
    if (isAfter(now, end)) {
      return { label: 'Expired', color: 'error' };
    }
    if (isWithinInterval(now, { start, end })) {
      return { label: 'In Progress', color: 'warning' };
    }
    return { label: 'Not Started', color: 'success' };
  };

  // Render events for selected date
  const renderSelectedDateEvents = () => {
    const dayEvents = getDayEvents(selectedDate);
    
    if (dayEvents.length === 0) {
      return (
        <Card variant="outlined" className="mt-4">
          <CardContent>
            <Typography color="textSecondary" className="text-center">
              No events on {format(selectedDate, 'MMM dd', { locale: enUS })}
            </Typography>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="mt-4 space-y-3">
        <Typography variant="h6" className="font-medium">
          Events on {format(selectedDate, 'MMM dd', { locale: enUS })}
        </Typography>
        {dayEvents.map((event) => {
          const timeStatus = getTimeStatus(event);
          const isExpanded = expandedEventId === event.taskId;
          
          return (
            <Card 
              key={event.taskId} 
              variant="outlined"
              className="transition-shadow hover:shadow-md"
            >
              <CardContent className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <Typography variant="h6" className="font-medium">
                      {event.title}
                    </Typography>
                    <div className="flex items-center gap-2 mt-1">
                      <Chip
                        size="small"
                        label={timeStatus.label}
                        color={timeStatus.color}
                      />
                      <Typography variant="body2" color="textSecondary" className="flex items-center gap-1">
                        <AccessTimeIcon fontSize="small" />
                        {format(new Date(event.startTime), 'HH:mm')} - {format(new Date(event.endTime), 'HH:mm')}
                      </Typography>
                    </div>
                  </div>
                  <IconButton
                    onClick={() => handleExpandClick(event.taskId)}
                    className="transform transition-transform"
                    sx={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }}
                  >
                    {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </div>
                <Collapse in={isExpanded}>
                  <div className="mt-3 pt-2 border-t">
                    <Typography variant="body2" color="textSecondary" className="flex items-start gap-2">
                      <DescriptionIcon fontSize="small" className="mt-1" />
                      <span>{event.description || 'No description'}</span>
                    </Typography>
                    <div className="mt-3 flex justify-end">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDialog(event);
                        }}
                      >
                        Edit Event
                      </Button>
                    </div>
                  </div>
                </Collapse>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const handleOpenDialog = (event = null) => {
    if (event) {
      setSelectedEvent(event);
      setEventForm({
        title: event.title,
        description: event.description,
        startTime: new Date(event.startTime),
        endTime: new Date(event.endTime),
      });
    } else {
      setSelectedEvent(null);
      setEventForm({
        title: '',
        description: '',
        startTime: selectedDate,
        endTime: selectedDate,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEvent(null);
    setEventForm({
      title: '',
      description: '',
      startTime: new Date(),
      endTime: new Date(),
    });
  };

  const handleSubmit = async () => {
    try {
      if (selectedEvent) {
        await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/api/calendar/tasks/${selectedEvent.taskId}`,
          eventForm,
          {
            headers: {
              AdminAuthorization: `Bearer ${localStorage.getItem('admintoken')}`,
            },
          }
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/calendar/tasks`,
          eventForm,
          {
            headers: {
              AdminAuthorization: `Bearer ${localStorage.getItem('admintoken')}`,
            },
          }
        );
      }
      fetchEvents();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/calendar/tasks/${selectedEvent.taskId}`,
        {
          headers: {
            AdminAuthorization: `Bearer ${localStorage.getItem('admintoken')}`,
          },
        }
      );
      fetchEvents();
      handleCloseDialog();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex-1 flex">
        <Paper className="w-1/3 p-4" elevation={3}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enUS}>
            <DateCalendar
              value={selectedDate}
              onChange={handleDateChange}
              slots={{ day: CustomDay }}
              className="w-full"
            />
          </LocalizationProvider>
          
          {/* Display events for selected date */}
          {renderSelectedDateEvents()}
        </Paper>
        
        <div className="flex-1 p-4">
          <Paper className="p-4 h-full" elevation={3}>
            <div className="flex justify-between items-center mb-4">
              <Typography variant="h5">
                All Tasks
              </Typography>
              <Fab
                color="primary"
                size="medium"
                onClick={() => handleOpenDialog()}
                aria-label="add task"
              >
                <AddIcon />
              </Fab>
            </div>
            
            <List>
              {events.map((event) => {
                const status = getEventStatus(event.startTime, event.endTime);
                return (
                  <ListItem
                    key={event.taskId}
                    button
                    onClick={() => handleOpenDialog(event)}
                    className="mb-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <ListItemText
                      primary={
                        <div className="flex items-center gap-2">
                          <span>{event.title}</span>
                          <Chip
                            icon={status.icon}
                            label={status.label}
                            color={status.color}
                            size="small"
                          />
                        </div>
                      }
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="textSecondary">
                            {format(new Date(event.startTime), 'MMM dd HH:mm')} - {format(new Date(event.endTime), 'MMM dd HH:mm')}
                          </Typography>
                          <Typography component="p" variant="body2" color="textSecondary">
                            {event.description}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                );
              })}
              {events.length === 0 && (
                <Typography color="textSecondary" className="text-center py-4">
                  No tasks available
                </Typography>
              )}
            </List>
          </Paper>
        </div>
      </div>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedEvent ? 'Edit Task' : 'Add New Task'}
          {selectedEvent && (
            <IconButton
              aria-label="delete"
              onClick={handleDelete}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <DeleteIcon />
            </IconButton>
          )}
        </DialogTitle>
        <DialogContent>
          <Box className="space-y-4 mt-4">
            <TextField
              fullWidth
              label="Title"
              value={eventForm.title}
              onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={4}
              value={eventForm.description}
              onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
            />
            <TextField
              fullWidth
              label="Start Time"
              type="datetime-local"
              value={format(new Date(eventForm.startTime), "yyyy-MM-dd'T'HH:mm")}
              onChange={(e) =>
                setEventForm({ ...eventForm, startTime: new Date(e.target.value) })
              }
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="End Time"
              type="datetime-local"
              value={format(new Date(eventForm.endTime), "yyyy-MM-dd'T'HH:mm")}
              onChange={(e) =>
                setEventForm({ ...eventForm, endTime: new Date(e.target.value) })
              }
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedEvent ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Calendar;