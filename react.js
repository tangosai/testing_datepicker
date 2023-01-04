const { Component, Fragment } = React;

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "July",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
];
const YEARS = new Array(201).fill(1900).map((value, index) => value + index);

class CustomWheel extends Component {
  constructor({ selected }) {
    super();
    this.state = { position: selected ? -(selected - 1) * 50 : 0 };
    this.offset = 0;
    this.dragging = false;
  }

  componentDidUpdate() {
    let selectedPosition = -(this.props.selected - 1) * 50;

    if (!this.dragging && this.state.position !== selectedPosition) {
      this.setState({ position: selectedPosition });
    }
  }

  onMouseDown = (event) => {
    this.previousY = event.touches ? event.touches[0].clientY : event.clientY;
    this.dragging = true;

    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("mouseup", this.onMouseUp);
    document.addEventListener("touchmove", this.onMouseMove);
    document.addEventListener("touchend", this.onMouseUp);
  };

  onMouseMove = (event) => {
    let clientY = event.touches ? event.touches[0].clientY : event.clientY;

    this.offset = clientY - this.previousY;

    let maxPosition = -this.props.data.length * 50;
    let position = this.state.position + this.offset;

    this.setState({ position: Math.max(maxPosition, Math.min(50, position)) });

    this.previousY = event.touches ? event.touches[0].clientY : event.clientY;
  };

  onMouseUp = () => {
    // calculate closeset snap
    let maxPosition = -(this.props.data.length - 1) * 50;
    let rounderPosition =
      Math.round((this.state.position + this.offset * 5) / 50) * 50;
    let finalPosition = Math.max(maxPosition, Math.min(0, rounderPosition));

    this.dragging = false;
    this.setState({ position: finalPosition });

    document.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("mouseup", this.onMouseUp);
    document.removeEventListener("touchmove", this.onMouseMove);
    document.removeEventListener("touchend", this.onMouseUp);

    this.props.onDateChange(this.props.type, -finalPosition / 50);
  };

  render() {
    let inlineStyle = {
      willChange: "transform",
      transition: `transform ${Math.abs(this.offset) / 100 + 0.1}s`,
      transform: `translateY(${this.state.position}px)`,
    };

    return (
      <div
        className="dragdealer year"
        onMouseDown={this.onMouseDown}
        onTouchStart={this.onMouseDown}
      >
        <ul className="handle" style={inlineStyle}>
          {this.props.data.map((year) => (
            <li key={year}>{year}</li>
          ))}
        </ul>
      </div>
    );
  }
}

class DatePicker extends Component {
  dateChanged = (type, changedData) => {
    let newDate;

    if (type === "day") {
      newDate = new Date(
        this.props.date.getFullYear(),
        this.props.date.getMonth(),
        changedData + 1
      );
    } else if (type === "month") {
      let maxDayInSelectedMonth = new Date(
        this.props.date.getFullYear(),
        changedData + 1,
        0
      ).getDate();
      let day = Math.min(this.props.date.getDate(), maxDayInSelectedMonth);

      newDate = new Date(this.props.date.getFullYear(), changedData, day);
    } else if (type === "year") {
      let maxDayInSelectedMonth = new Date(
        1900 + changedData,
        this.props.date.getMonth() + 1,
        0
      ).getDate();
      let day = Math.min(this.props.date.getDate(), maxDayInSelectedMonth);

      newDate = new Date(1900 + changedData, this.props.date.getMonth(), day);
    }

    this.props.onDateChange(newDate);
  };

  render() {
    this.days = new Array(
      new Date(
        this.props.date.getFullYear(),
        this.props.date.getMonth() + 1,
        0
      ).getDate()
    )
      .fill(1)
      .map((value, index) => value + index);

    this.months = MONTHS;
    this.years = YEARS;

    return (
      <div className="date-picker">
        <CustomWheel
          type="day"
          data={this.days}
          selected={this.props.date.getDate()}
          onDateChange={this.dateChanged}
        />
        <CustomWheel
          type="month"
          data={this.months}
          selected={this.props.date.getMonth() + 1}
          onDateChange={this.dateChanged}
        />
        <CustomWheel
          type="year"
          data={this.years}
          selected={this.props.date.getYear() + 1}
          onDateChange={this.dateChanged}
        />
      </div>
    );
  }
}

class App extends Component {
  state = { date: new Date() };

  resetDate = () => {
    this.setState({ date: new Date() });
  };

  dateChanged = (newDate) => {
    this.setState({ date: newDate });
  };

  render() {
    return (
      <Fragment>
        <div className="date">
          {this.state.date.getDate()} {MONTHS[this.state.date.getMonth()]}{" "}
          {this.state.date.getFullYear()}
        </div>
        <DatePicker date={this.state.date} onDateChange={this.dateChanged} />
        <button className="reset" onClick={this.resetDate}>
          Reset Date
        </button>
      </Fragment>
    );
  }
}

ReactDOM.render(<App />, document.querySelector("#app"));
