import { useEffect, useRef } from 'react';
import type { SuccessSummary } from './RegistrationForm';

/*
 * Post-submit confirmation screen: green "thank you" box (mentioning the
 * newsletter when the user opted in) plus a navy card per registered series,
 * mirroring the production success state.
 */
interface Props {
  summary: SuccessSummary;
  onReset: () => void;
}

export default function SuccessPanel({ summary, onReset }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);

  // The form just disappeared from under the user. Moving focus to the
  // confirmation box makes screen readers announce the outcome instead of
  // leaving focus on an element that no longer exists.
  useEffect(() => {
    boxRef.current?.focus();
  }, []);

  return (
    <div className="registration-success">
      <div ref={boxRef} tabIndex={-1} className="success-confirmation-box" role="status">
        <p className="success-confirmation-text">
          Thank you, {summary.firstName}! Your registration has been received. Check your email
          for confirmation and joining details.
          {summary.newsletter && ' You are also signed up for the weekly InnovateUS newsletter.'}
        </p>
      </div>

      <ul className="success-series-list">
        {summary.items.map((item) => (
          <li key={item.key} className="success-series-card">
            {item.icon && <img className="success-series-icon" src={item.icon} alt="" />}
            <span className="success-series-title">{item.title}</span>
          </li>
        ))}
      </ul>

      <div className="success-actions">
        <button type="button" className="btn btn-secondary" onClick={onReset}>
          Register for more series
        </button>
      </div>
    </div>
  );
}
