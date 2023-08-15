export const throw404 = (res: any, msg: string) => {
  console.error(msg)
  return res.status(404).send();
}

export const handleUnexpectedError = (res: any, err: any) => {
  console.error(err);
  return res.status(500).send('Unexpected Error');
}